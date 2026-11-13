import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const ESTADOS_DE_CUENTA = ["activa", "inactivo", "inactiva", "eliminada", "pendiente", "vencido"];

/**
 * Extrae latitud y longitud de una URL de Google Maps.
 */
function extraerCoordenadasDeGoogleMaps(url: string): { lat: number; lng: number } | null {
  if (!url || typeof url !== 'string') return null;
  
  // Formato @lat,lng
  const matchAt = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (matchAt) return { lat: parseFloat(matchAt[1]), lng: parseFloat(matchAt[2]) };
  
  // Formato ?q=lat,lng o &query=lat,lng
  const matchQ = url.match(/[?&](?:q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (matchQ) return { lat: parseFloat(matchQ[1]), lng: parseFloat(matchQ[2]) };
  
  // Formato !3d...!4d (vista de calle)
  const matchData = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (matchData) return { lat: parseFloat(matchData[1]), lng: parseFloat(matchData[2]) };
  
  return null;
}

/**
 * Valida que las coordenadas estén dentro del rango de México.
 */
function coordenadasValidas(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) && !isNaN(lng) &&
    lat !== 0 && lng !== 0 &&
    lat >= 14 && lat <= 33 && 
    lng >= -119 && lng <= -86
  );
}

/**
 * Geocodifica usando Nominatim (solo como respaldo).
 */
async function geocodificarNominatim(direccion: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&limit=1&countrycodes=mx`,
      { headers: { 'User-Agent': 'LaOpticaCercadeMi/1.0', 'Accept-Language': 'es' } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const snapshot = await getDocs(collection(db, 'opticas'));
    const resultados: any[] = [];
    let procesadasGoogleMaps = 0;
    let procesadasNominatim = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const nombre = data.nombre || data.nombreComercial || 'Sin nombre';
      
      // Verificar si ya tiene coordenadas válidas (no 0, no undefined)
      const yaTieneCoords = typeof data.latitud === 'number' && typeof data.longitud === 'number' && data.latitud !== 0 && data.longitud !== 0;

      if (yaTieneCoords) {
        resultados.push({ id: docSnap.id, nombre, success: true, fuente: 'ya-tenia-coordenadas' });
        continue;
      }

      let coords: { lat: number; lng: number } | null = null;
      let fuente = '';

      // PRIORIDAD 1: Extraer del link de Google Maps (Instantáneo, sin rate limit)
      if (data.urlGoogleMaps) {
        coords = extraerCoordenadasDeGoogleMaps(data.urlGoogleMaps);
        if (coords && coordenadasValidas(coords.lat, coords.lng)) {
          fuente = 'google-maps-url';
          procesadasGoogleMaps++;
        } else {
          coords = null; // Descartar si es un short link o inválido
        }
      }

      // PRIORIDAD 2: Nominatim con dirección textual (Solo si falló Google Maps)
      if (!coords) {
        const estadoGeo = data.estadoGeografico || (ESTADOS_DE_CUENTA.includes(String(data.estado || "").toLowerCase()) ? "" : data.estado);
        const direccion = [data.direccion, data.ciudad, estadoGeo, data.cp, 'Mexico'].filter(Boolean).join(', ');

        if (direccion.length > 10) {
          coords = await geocodificarNominatim(direccion);
          if (coords && coordenadasValidas(coords.lat, coords.lng)) {
            fuente = 'nominatim';
            procesadasNominatim++;
          }
        }
      }

      // Guardar en Firestore si se encontraron coordenadas
      if (coords) {
        try {
          await updateDoc(doc(db, 'opticas', docSnap.id), {
            latitud: coords.lat,
            longitud: coords.lng,
          });
          resultados.push({ id: docSnap.id, nombre, success: true, fuente, latitud: coords.lat, longitud: coords.lng });
        } catch (updateError: any) {
          // Si falla el update de UNA óptica, no detenemos el bucle
          resultados.push({ id: docSnap.id, nombre, success: false, fuente: 'error-update', reason: updateError.message });
        }
      } else {
        resultados.push({ id: docSnap.id, nombre, success: false, fuente: 'ninguna', reason: 'No se pudieron extraer coordenadas' });
      }

      // Rate limiting estricto: solo cuando se usó Nominatim
      if (fuente === 'nominatim') {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
    }

    return NextResponse.json({
      success: true,
      totalOpticas: snapshot.size,
      resumen: {
        yaTenianCoordenadas: resultados.filter(r => r.fuente === 'ya-tenia-coordenadas').length,
        extraidasDeGoogleMaps: procesadasGoogleMaps,
        extraidasDeNominatim: procesadasNominatim,
        fallidas: resultados.filter(r => !r.success).length,
      },
      detalles: resultados,
    });
  } catch (error: any) {
    console.error('❌ ERROR EN GEOCODE-ALL:', error);
    return NextResponse.json({ error: 'Error interno', detalle: error.message }, { status: 500 });
  }
}