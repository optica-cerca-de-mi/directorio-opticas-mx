import { NextRequest, NextResponse } from 'next/server';
// ✅ Importamos nuestra función de expansión semántica clínica
import { expandirConsulta } from '@/lib/concepts-map';

// ═══════════════════════════════════════════════════════════════
// CONTEXTO DEL DIRECTORIO (Se inyecta en el prompt de la IA)
// ═══════════════════════════════════════════════════════════════
const DIRECTORIO_CONTEXTO = {
  ciudades: [
    'CDMX', 'Ciudad de México', 'Cuautitlán Izcalli', 'Estado de México',
    'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro', 'Mérida', 'Cancún',
    'Tijuana', 'Toluca', 'Aguascalientes', 'León', 'San Luis Potosí'
  ],
  especialidadesGenericas: [
    'Optometría General', 'Lentes de Contacto', 'Lentes Progresivos',
    'Oftalmología Pediátrica', 'Baja Visión', 'Examen de la Vista',
    'Cirugía Refractiva', 'Lentes para Computadora', 'Ortoqueratología'
  ],
  seguros: [
    'GNP', 'AXA', 'MetLife', 'Seguros Monterrey', 'Zurich',
    'Allianz', 'Mapfre', 'Inbursa', 'Plan Seguro', 'AUNA'
  ]
};

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPT: Las "Reglas del Cerebro" de Franklin
// ═══════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `Eres Franklin, el asistente inteligente del Directorio de Ópticas de México.
Tu único objetivo es analizar la consulta del usuario y extraer filtros de búsqueda estructurados en formato JSON estricto.

CONTEXTO DEL DIRECTORIO:
- Ciudades disponibles: ${DIRECTORIO_CONTEXTO.ciudades.join(', ')}
- Especialidades Genéricas: ${DIRECTORIO_CONTEXTO.especialidadesGenericas.join(', ')}
- Especialidades Personalizadas: Las ópticas pueden tener especialidades únicas (ej: Ortoqueratología, Lentes para ciclismo, Atención a domicilio). Extrae cualquier especialidad específica que el usuario mencione o que esté relacionada clínicamente con sus síntomas.
- Seguros: ${DIRECTORIO_CONTEXTO.seguros.join(', ')}

REGLAS DE EXTRACCIÓN:
1. ciudad: Normaliza la ubicación a una de las ciudades de la lista. (Ej: "cerca de Perinorte" -> "Cuautitlán Izcalli", "DF" -> "CDMX"). Si no hay ciudad, usa null.
2. especialidad: Extrae la especialidad o servicio específico. Si el usuario describe un síntoma (ej: "veo borroso de lejos"), usa los términos clínicos formales proporcionados en el contexto adicional (ej: "Miopía", "Examen de la Vista"). Si no hay, usa null.
3. seguro: Normaliza a uno de la lista. Si no hay, usa null.
4. precio: "low" (barato, económico), "medium" (normal), "high" (premium, lujo). Si no se menciona, usa null.
5. ordenar_por: "rating" (la mejor, top), "precio" (más barato), "relevancia" (default).
6. abierto_ahora: true si el usuario dice "que abra hoy", "ahora", "abierto". Si no, false.
7. pasos_pensamiento: Un array de 2 a 4 frases cortas que describan lo que Franklin "está haciendo" basado en los filtros detectados.
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

// ═══════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL DE LA API (Groq + Expansión Semántica)
// ═══════════════════════════════════════════════════════════════
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

    // ✅ 1. EXPANSIÓN SEMÁNTICA LOCAL (Nuestro superpoder clínico)
    // Convierte "me duele la cabeza al leer" en ["me duele la cabeza al leer", "Lentes Progresivos", "Presbicia", ...]
    const terminosExpandidos = expandirConsulta(query);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('❌ Falta la variable de entorno GROQ_API_KEY');
      return NextResponse.json(
        { error: 'Error de configuración del servidor.' },
        { status: 500 }
      );
    }

    // ✅ 2. Inyectamos los términos expandidos en el prompt para que la IA los considere
    const promptMejorado = `${SYSTEM_PROMPT}

CONTEXTO CLÍNICO ADICIONAL PARA ESTA CONSULTA:
El usuario usó la frase: "${query}".
Nuestro sistema médico identifica que esto puede estar relacionado con los siguientes términos formales. Por favor, úsalos para extraer la "especialidad" correcta:
${terminosExpandidos.map((t: string) => `- ${t}`).join('\n')}
`;

    // 3. Llamada a la API de Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: promptMejorado },
          { role: 'user', content: query }
        ],
        temperature: 0.1, // Reducido para mayor precisión en extracción
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Error en la API de Groq:', errorData);
      throw new Error('Fallo en la comunicación con Groq');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ La IA no devolvió un JSON válido:', content);
      parsedResponse = {
        filtros: { ciudad: null, especialidad: null, seguro: null, precio: null, ordenar_por: 'relevancia', abierto_ahora: false },
        pasos_pensamiento: ['Analizando tu búsqueda...', 'Buscando las mejores opciones...'],
        mensaje_final: 'He procesado tu búsqueda. Aquí tienes algunas opciones.'
      };
    }

    // ✅ 4. Devolvemos los términos expandidos al frontend para redundancia
    return NextResponse.json({
      success: true,
      data: {
        ...parsedResponse,
        terminos_expandidos: terminosExpandidos
      },
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