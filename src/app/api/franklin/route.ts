import { NextRequest, NextResponse } from 'next/server';
import { expandirConsulta } from '@/lib/concepts-map';

// ═══════════════════════════════════════════════════════════════
// CONTEXTO DEL DIRECTORIO (Base para normalización)
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
// SYSTEM PROMPT: Reglas estrictas con jerarquía de prioridad
// ═══════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `Eres Franklin, el asistente inteligente del Directorio de Ópticas de México.
Tu único objetivo es analizar la consulta del usuario y extraer filtros de búsqueda estructurados en formato JSON estricto.

REGLA CRÍTICA DE PRIORIDAD:
Cuando extraigas el campo "especialidad", SIEMPRE debes usar primero los términos de la lista "TÉRMINOS QUE LAS ÓPTICAS REGISTRAN (PRIORIDAD 1)". 
Solo usa los "TÉRMINOS MÉDICOS DE RESPALDO (PRIORIDAD 2)" si no hay ninguna coincidencia clara con la primera lista.
NUNCA inventes términos que no estén en las listas proporcionadas.

CONTEXTO DEL DIRECTORIO:
- Ciudades disponibles: ${DIRECTORIO_CONTEXTO.ciudades.join(', ')}
- Especialidades Genéricas: ${DIRECTORIO_CONTEXTO.especialidadesGenericas.join(', ')}
- Seguros: ${DIRECTORIO_CONTEXTO.seguros.join(', ')}

REGLAS DE EXTRACCIÓN:
1. ciudad: Normaliza la ubicación a una de las ciudades de la lista. Si no hay, usa null.
2. especialidad: Extrae la especialidad o servicio específico. Prioriza los términos de la PRIORIDAD 1 proporcionados en el contexto dinámico. Si no hay, usa null.
3. seguro: Normaliza a uno de la lista. Si no hay, usa null.
4. abierto_ahora: true si el usuario dice "que abra hoy", "ahora", "abierto". Si no, false.
5. pasos_pensamiento: Un array de 2 a 3 frases cortas que describan lo que Franklin "está haciendo" basado en los filtros detectados.
6. mensaje_final: Una frase cálida, natural y en español mexicano que resuma lo que se encontró.

FORMATO DE SALIDA (JSON ESTRICTO, SIN MARKDOWN, SIN TEXTO EXTRA):
{
  "filtros": {
    "ciudad": string | null,
    "especialidad": string | null,
    "seguro": string | null,
    "abierto_ahora": boolean
  },
  "pasos_pensamiento": string[],
  "mensaje_final": string
}`;

// ═══════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL DE LA API
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

    // 1. EXPANSIÓN SEMÁNTICA CON JERARQUÍA
    const expansion = expandirConsulta(query);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('❌ Falta la variable de entorno GROQ_API_KEY');
      return NextResponse.json(
        { error: 'Error de configuración del servidor.' },
        { status: 500 }
      );
    }

    // 2. INYECTAR CONTEXTO DINÁMICO CON PRIORIDADES CLARAS
    const promptDinamico = `${SYSTEM_PROMPT}

CONTEXTO CLÍNICO Y PRÁCTICO PARA ESTA CONSULTA ESPECÍFICA:
El usuario escribió: "${query}"

TÉRMINOS QUE LAS ÓPTICAS REGISTRAN (PRIORIDAD 1 - USA ESTOS PRIMERO):
${expansion.terminosOptica.map((t: string) => `- ${t}`).join('\n')}

TÉRMINOS MÉDICOS DE RESPALDO (PRIORIDAD 2 - SOLO SI NO HAY MATCH ARRIBA):
${expansion.terminosClinicos.length > 0 ? expansion.terminosClinicos.map((t: string) => `- ${t}`).join('\n') : '(ninguno aplicable)'}

Instrucción final: Extrae la "especialidad" usando SIEMPRE un término de la PRIORIDAD 1 si aplica. Ejemplo: si el usuario dice "soy diabético", la especialidad debe ser "Consulta de diabetes" (no "Retinopatía diabética").`;

    // 3. LLAMADA A GROQ
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: promptDinamico },
          { role: 'user', content: query }
        ],
        temperature: 0.1, // Baja temperatura para máxima precisión en extracción
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
    let content = data.choices[0].message.content;

    // Limpieza de seguridad: eliminar bloques de markdown si la IA los agrega a pesar del json_object
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ La IA no devolvió un JSON válido:', content);
      parsedResponse = {
        filtros: { ciudad: null, especialidad: null, seguro: null, abierto_ahora: false },
        pasos_pensamiento: ['Analizando tu búsqueda...', 'Buscando las mejores opciones...'],
        mensaje_final: 'He procesado tu búsqueda. Aquí tienes algunas opciones.'
      };
    }

    // 4. DEVOLVER RESPUESTA CON LOS TÉRMINOS EXPANDIDOS PARA EL FRONTEND
    return NextResponse.json({
      success: true,
      data: {
        ...parsedResponse,
        terminos_expandidos: expansion.terminosOptica, // Para respaldo en frontend
        terminos_clinicos: expansion.terminosClinicos,
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