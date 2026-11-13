import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de geocoding usando Nominatim (OpenStreetMap)
 * Gratuito, sin API key, con límite de 1 request/segundo.
 */

// Valores que pertenecen al ciclo de vida de la cuenta, NO al estado geográfico
const ESTADOS_DE_CUENTA = ["activa", "inactivo", "inactiva", "eliminada", "pendiente", "vencido"];

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

    // ✅ Sanitizar: si el estado es un valor de cuenta, ignorarlo en la búsqueda
    const estadoValido = ESTADOS_DE_CUENTA.includes(String(estado || "").toLowerCase()) ? "" : estado;
    
    // Construir query de búsqueda optimizada para México
    const partes = [direccion, ciudad, estadoValido, cp, 'Mexico'].filter(Boolean);
    const query = partes.join(', ');

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