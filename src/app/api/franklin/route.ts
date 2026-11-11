import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════
// CONTEXTO DEL DIRECTORIO (Se inyecta en el prompt de la IA)
// ═══════════════════════════════════════════════════════
const DIRECTORIO_CONTEXTO = {
  ciudades: [
    'CDMX', 'Ciudad de México', 'Cuautitlán Izcalli', 'Estado de México', 
    'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro', 'Mérida', 'Cancún', 
    'Tijuana', 'Toluca', 'Aguascalientes', 'León', 'San Luis Potosí'
  ],
  especialidades: [
    'Optometría General', 'Lentes de Contacto', 'Lentes Progresivos', 
    'Oftalmología Pediátrica', 'Baja Visión', 'Examen de la Vista', 
    'Cirugía Refractiva', 'Lentes para Computadora', 'Ortoqueratología'
  ],
  seguros: [
    'GNP', 'AXA', 'MetLife', 'Seguros Monterrey', 'Zurich', 
    'Allianz', 'Mapfre', 'Inbursa', 'Plan Seguro'
  ]
};

// ═══════════════════════════════════════════════════════
// SYSTEM PROMPT: Las "Reglas del Cerebro" de Franklin
// ═══════════════════════════════════════════════════════
const SYSTEM_PROMPT = `Eres Franklin, el asistente inteligente del Directorio de Ópticas de México.
Tu único objetivo es analizar la consulta del usuario y extraer filtros de búsqueda estructurados en formato JSON estricto.

CONTEXTO DEL DIRECTORIO:
- Ciudades disponibles: ${DIRECTORIO_CONTEXTO.ciudades.join(', ')}
- Especialidades: ${DIRECTORIO_CONTEXTO.especialidades.join(', ')}
- Seguros: ${DIRECTORIO_CONTEXTO.seguros.join(', ')}

REGLAS DE EXTRACCIÓN:
1. ciudad: Normaliza la ubicación a una de las ciudades de la lista. (Ej: "cerca de Perinorte" -> "Cuautitlán Izcalli", "DF" -> "CDMX"). Si no hay ciudad, usa null.
2. especialidad: Normaliza a una de la lista. (Ej: "lentes para niños" -> "Oftalmología Pediátrica"). Si no hay, usa null.
3. seguro: Normaliza a uno de la lista. Si no hay, usa null.
4. precio: "low" (barato, económico, buen precio), "medium" (normal, estándar), "high" (premium, lujo, diseñador). Si no se menciona, usa null.
5. ordenar_por: "rating" (la mejor, top, mejor calificada), "precio" (más barato, menor precio), "relevancia" (default).
6. abierto_ahora: true si el usuario dice "que abra hoy", "ahora", "abierto". Si no, false.
7. pasos_pensamiento: Un array de 2 a 4 frases cortas que describan lo que Franklin "está haciendo" basado en los filtros detectados. Usa emojis relevantes.
8. mensaje_final: Una frase cálida, natural y en español mexicano que resuma lo que se encontró.

FORMATO DE SALIDA (JSON ESTRICTO, SIN MARKDOWN, SIN TEXTO EXTRA):
{
  "filtros": {
    "ciudad": string | null,
    "especialidad": string | null,
    "seguro": string | null,
    "precio": "low" | "medium" | "high" | null,
    "ordenar_por": "rating" | "precio" | "relevancia" | null,
    "abierto_ahora": boolean
  },
  "pasos_pensamiento": string[],
  "mensaje_final": string
}`;

// ═══════════════════════════════════════════════════════
// HANDLER PRINCIPAL DE LA API (Groq)
// ═══════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json(
        { error: 'La consulta debe tener al menos 3 caracteres.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('❌ Falta la variable de entorno GROQ_API_KEY');
      return NextResponse.json(
        { error: 'Error de configuración del servidor.' },
        { status: 500 }
      );
    }

    // Llamada a la API de Groq (compatible con OpenAI)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
           model: 'qwen/qwen3.8-27b', // Modelo Qwen en Groq: rápido, entiende español perfecto y es 100% gratuito
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query }
        ],
        temperature: 0.2, // Baja temperatura = respuestas más deterministas
        max_tokens: 500,
        response_format: { type: 'json_object' }, // Fuerza salida JSON
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Error en la API de Groq:', errorData);
      throw new Error('Fallo en la comunicación con Groq');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parsear y validar el JSON de respuesta
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ La IA no devolvió un JSON válido:', content);
      // Fallback de emergencia
      parsedResponse = {
        filtros: { ciudad: null, especialidad: null, seguro: null, precio: null, ordenar_por: 'relevancia', abierto_ahora: false },
        pasos_pensamiento: ['🔍 Analizando tu búsqueda...', '✨ Buscando las mejores opciones...'],
        mensaje_final: 'He procesado tu búsqueda. Aquí tienes algunas opciones.'
      };
    }

    // Devolver la respuesta al frontend
    return NextResponse.json({
      success: true,
      data: parsedResponse,
    });

  } catch (error) {
    console.error('❌ Error crítico en la API de Franklin:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'No pude procesar tu búsqueda en este momento. Por favor, intenta de nuevo.' 
      },
      { status: 500 }
    );
  }
}