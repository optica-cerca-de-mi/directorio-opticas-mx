import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    // Protección básica con variable de entorno
    const { authorization } = req.headers;
    if (authorization !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const snapshot = await getDocs(collection(db, 'opticas'));
    const resultados = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      if (!data.latitud || !data.longitud) {
        const direccion = [data.direccion, data.ciudad, data.estado, data.cp, 'Mexico']
          .filter(Boolean)
          .join(', ');

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&limit=1&countrycodes=mx`,
            {
              headers: {
                'User-Agent': 'LaOpticaCercadeMi/1.0',
                'Accept-Language': 'es',
              },
            }
          );

          const nominatimData = await response.json();

          if (nominatimData.length > 0) {
            await updateDoc(doc(db, 'opticas', docSnap.id), {
              latitud: parseFloat(nominatimData[0].lat),
              longitud: parseFloat(nominatimData[0].lon),
            });
            resultados.push({ id: docSnap.id, success: true });
          } else {
            resultados.push({ id: docSnap.id, success: false, reason: 'No encontrado' });
          }

          // Rate limiting: esperar 1.1 segundos entre requests (límite de Nominatim)
          await new Promise((resolve) => setTimeout(resolve, 1100));
        } catch (error) {
          resultados.push({ id: docSnap.id, success: false, reason: 'Error' });
        }
      }
    }

    return NextResponse.json({
      success: true,
      total: snapshot.size,
      procesados: resultados.length,
      resultados,
    });
  } catch (error) {
    console.error('Error en geocoding masivo:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}