import { NextRequest, NextResponse } from 'next/server';

const ESTADOS_DE_CUENTA = ["activa", "inactivo", "inactiva", "eliminada", "pendiente", "vencido"];

async function buscarEnNominatim(
  query: string
): Promise<{ lat: number; lng: number; display: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=mx`,
      {
        headers: {
          'User-Agent': 'LaOpticaCercadeMi/1.0 (contacto@laopticacercademi.mx)',
          'Accept-Language': 'es',
        },
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display: data[0].display_name,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { direccion, ciudad, estado, cp } = body;

    if (!ciudad && !direccion) {
      return NextResponse.json(
        { success: false, error: 'Se requiere al menos dirección o ciudad' },
        { status: 400 }
      );
    }

    const estadoValido = ESTADOS_DE_CUENTA.includes(String(estado || '').toLowerCase()) ? '' : estado;

    // Queries en orden de especificidad (de más precisa a más general)
    const queries: string[] = [];
    const completa = [direccion, ciudad, estadoValido, cp, 'Mexico'].filter(Boolean).join(', ');
    if (completa) queries.push(completa);

    const ciudadEstado = [ciudad, estadoValido, 'Mexico'].filter(Boolean).join(', ');
    if (ciudadEstado && ciudadEstado !== completa) queries.push(ciudadEstado);

    const soloCiudad = [ciudad, 'Mexico'].filter(Boolean).join(', ');
    if (soloCiudad && soloCiudad !== ciudadEstado) queries.push(soloCiudad);

    const unicas = [...new Set(queries)];

    let resultado = null;
    let fuente = '';

    for (let i = 0; i < unicas.length; i++) {
      const r = await buscarEnNominatim(unicas[i]);
      if (r) {
        resultado = r;
        fuente = i === 0 ? 'direccion-exacta' : i === 1 ? 'ciudad-estado' : 'ciudad';
        break;
      }
      if (i < unicas.length - 1) {
        await new Promise((res) => setTimeout(res, 1100));
      }
    }

    if (!resultado) {
      return NextResponse.json({
        success: false,
        message: 'No se encontraron coordenadas ni por dirección ni por ciudad',
        latitud: null,
        longitud: null,
      });
    }

    return NextResponse.json({
      success: true,
      latitud: resultado.lat,
      longitud: resultado.lng,
      display_name: resultado.display,
      fuente,
    });
  } catch (error) {
    console.error('Error en geocoding:', error);
    return NextResponse.json(
      { error: 'Error al geocodificar la dirección' },
      { status: 500 }
    );
  }
}