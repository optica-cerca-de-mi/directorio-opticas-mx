import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const ESTADOS_DE_CUENTA = ["activa", "inactivo", "inactiva", "eliminada", "pendiente", "vencido"];

/**
 * Extrae latitud y longitud de una URL de Google Maps.
 * Formatos soportados:
 *   https://maps.google.com/?q=19.644123,-99.234567
 *   https://www.google.com/maps/place/.../@19.644123,-99.234567,17z
 *   https://maps.google.com/maps?q=19.644123,-99.234567
 *   https://www.google.com/maps/search/?api=1&query=19.644123,-99.234567
 *   https://www.google.com/maps?cid=... (NO tiene lat/lng -> null)
 *   https://maps.app.goo.gl/... (short link -> null, requiere Nominatim)
 */
function extraerCoordenadasDeGoogleMaps(url: string): { lat: number; lng: number } | null {
  if (!url || typeof url !== 'string') return null;

  // 1. Formato @lat,lng (vista de mapa)
  const matchAt = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (matchAt) {
    return { lat: parseFloat(matchAt[1]), lng: parseFloat(matchAt[2]) };
  }

  // 2. Formato ?q=lat,lng o &query=lat,lng
  const matchQ = url.match(/[?&](?:q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (matchQ) {
    return { lat: parseFloat(matchQ[1]), lng: parseFloat(matchQ[2]) };
  }

  // 3. Formato !3d...!4d (vista de calle / data=)
  const matchData = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (matchData) {
    return { lat: parseFloat(matchData[1]), lng: parseFloat(matchData[2]) };
  }

  // 4. Formato /data=!3m4!1...!2d...!3e0 (variantes)
  const matchData2 = url.match(/(-?\d{2}\.\d+),\s*(-?\d{2}\.\d+)/);
  if (matchData2) {
    return { lat: parseFloat(matchData2[1]), lng: parseFloat(matchData2[2]) };
  }

  return null;
}

/**
 * Validación de rango: latitud -90 a 90, longitud -180 a 180.
 * Descarta 0,0 y valores fuera de México.
 */
function coordenadasValidas(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) && !isNaN(lng) &&
    lat !== 0 && lng !== 0 &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    // Rango aproximado de México
    lat >= 14 && lat <= 33 &&
    lng >= -119 && lng <= -86
  );
}

/**
 * Geocodifica una dirección usando Nominatim (OpenStreetMap).
 */
async function geocodificarNominatim(direccion: string): Promise<{ lat: number; lng: number } | null> {
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

    if (!response.ok) return null;

    const data = await response.json();
    if (data.length === 0) return null;

    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (error) {
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
    const resultados: Array<{
      id: string;
      nombre: string;
      success: boolean;
      fuente: string;
      latitud?: number;
      longitud?: number;
      reason?: string;
    }> = [];

    let procesadasGoogleMaps = 0;
    let procesadasNominatim = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const nombre = data.nombre || data.nombreComercial || 'Sin nombre';

      // Verificar si ya tiene coordenadas válidas (no 0, no undefined)
      const yaTieneCoords =
        typeof data.latitud === 'number' &&
        typeof data.longitud === 'number' &&
        data.latitud !== 0 &&
        data.longitud !== 0;

      if (yaTieneCoords) {
        resultados.push({ id: docSnap.id, nombre, success: true, fuente: 'ya-tenia-coordenadas' });
        continue;
      }

      let coords: { lat: number; lng: number } | null = null;
      let fuente = '';

      // PRIORIDAD 1: Extraer del link de Google Maps
      if (data.urlGoogleMaps) {
        coords = extraerCoordenadasDeGoogleMaps(data.urlGoogleMaps);
        if (coords && coordenadasValidas(coords.lat, coords.lng)) {
          fuente = 'google-maps-url';
          procesadasGoogleMaps++;
        } else {
          coords = null; // Descartar si es inválida o short link
        }
      }

      // PRIORIDAD 2: Nominatim con dirección textual
      if (!coords) {
        const estadoGeo = data.estadoGeografico ||
          (ESTADOS_DE_CUENTA.includes(String(data.estado || "").toLowerCase()) ? "" : data.estado);

        const direccion = [data.direccion, data.ciudad, estadoGeo, data.cp, 'Mexico']
          .filter(Boolean)
          .join(', ');

        if (direccion.length > 10) {
          coords = await geocodificarNominatim(direccion);
          if (coords && coordenadasValidas(coords.lat, coords.lng)) {
            fuente = 'nominatim';
            procesadasNominatim++;
          } else {
            coords = null;
          }
        }
      }

      if (coords) {
        await updateDoc(doc(db, 'opticas', docSnap.id), {
          latitud: coords.lat,
          longitud: coords.lng,
        });
        resultados.push({
          id: docSnap.id,
          nombre,
          success: true,
          fuente,
          latitud: coords.lat,
          longitud: coords.lng,
        });
      } else {
        const motivo = data.urlGoogleMaps
          ? 'URL de Google Maps no parseable (posiblemente short link maps.app.goo.gl) y dirección no encontrada en Nominatim'
          : 'Sin urlGoogleMaps y dirección no encontrada en Nominatim';
        resultados.push({ id: docSnap.id, nombre, success: false, fuente: 'ninguna', reason: motivo });
      }

      // Rate limiting solo cuando se usó Nominatim (Google Maps es parseo local, instantáneo)
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
  } catch (error) {
    console.error('Error en geocoding masivo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}