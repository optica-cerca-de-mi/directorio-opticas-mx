import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de geocoding usando Nominatim (OpenStreetMap)
 * Gratuito, sin API key, con límite de 1 request/segundo
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { direccion, ciudad, estado, cp } = body;

    if (!direccion && !ciudad) {
      return NextResponse.json(
        { error: 'Se requiere al menos dirección o ciudad' },
        { status: 400 }
      );
    }

    // Construir query de búsqueda
    const partes = [direccion, ciudad, estado, cp, 'Mexico'].filter(Boolean);
    const query = partes.join(', ');

    // Llamar a Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=mx`,
      {
        headers: {
          'User-Agent': 'LaOpticaCercadeMi/1.0 (contacto@laopticacercademi.mx)',
          'Accept-Language': 'es',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error en Nominatim');
    }

    const data = await response.json();

    if (data.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No se encontraron coordenadas para esta dirección',
        latitud: null,
        longitud: null,
      });
    }

    const resultado = data[0];
    return NextResponse.json({
      success: true,
      latitud: parseFloat(resultado.lat),
      longitud: parseFloat(resultado.lon),
      display_name: resultado.display_name,
    });
  } catch (error) {
    console.error('Error en geocoding:', error);
    return NextResponse.json(
      { error: 'Error al geocodificar la dirección' },
      { status: 500 }
    );
  }
}