import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const ESTADOS_DE_CUENTA = ["activa", "inactivo", "inactiva", "eliminada", "pendiente", "vencido"];

export async function POST(req: NextRequest) {
  try {
    // Protección básica con variable de entorno
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const snapshot = await getDocs(collection(db, 'opticas'));
    const resultados = [];
    let procesados = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      // Solo geocodificar si no tiene coordenadas válidas
      if (!data.latitud || !data.longitud) {
        // Usar estadoGeografico si existe, si no, intentar con estado (filtrando valores de cuenta)
        const estadoGeo = data.estadoGeografico || 
          (ESTADOS_DE_CUENTA.includes(String(data.estado || "").toLowerCase()) ? "" : data.estado);

        const direccion = [data.direccion, data.ciudad, estadoGeo, data.cp, 'Mexico']
          .filter(Boolean)
          .join(', ');

        if (direccion.length > 5) { // Validación mínima para no hacer requests vacíos
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&limit=1&countrycodes=mx`,
              {
                headers: {
                  'User-Agent': 'LaOpticaCercadeMi/1.0 (contacto@laopticacercademi.mx)',
                  'Accept-Language': 'es',
                },
              }
            );

            const nominatimData = await response.json();

            if (nominatimData.length > 0) {
              await updateDoc(doc(db, 'opticas', docSnap.id), {
                latitud: parseFloat(nominatimData[0].lat),
                longitud: parseFloat(nominatimData[0].lon),
                estadoGeografico: estadoGeo || data.estadoGeografico // Asegurar que se guarde si se pudo inferir
              });
              resultados.push({ id: docSnap.id, nombre: data.nombre || data.nombreComercial, success: true });
            } else {
              resultados.push({ id: docSnap.id, nombre: data.nombre || data.nombreComercial, success: false, reason: 'No encontrado en Nominatim' });
            }
            procesados++;
            
            // Rate limiting estricto: 1.1 segundos entre requests para respetar a Nominatim
            await new Promise((resolve) => setTimeout(resolve, 1100));
          } catch (error) {
            resultados.push({ id: docSnap.id, nombre: data.nombre || data.nombreComercial, success: false, reason: 'Error de red' });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalOpticas: snapshot.size,
      procesadas: procesados,
      detalles: resultados,
    });
  } catch (error) {
    console.error('Error en geocoding masivo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}