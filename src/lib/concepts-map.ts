/**
 * DICCIONARIO DE CONCEPTOS ÓPTICOS - VERSIÓN PRÁCTICA
 * 
 * Jerarquía de búsqueda:
 * 1. terminosOptica: Términos que las ópticas REALMENTE registran en sus fichas.
 * 2. terminosClinicos: Términos médicos de respaldo (CIE-10/SNOMED), solo si no hay match.
 * 3. sinonimos: Lenguaje coloquial del paciente.
 * 
 * Franklin SIEMPRE busca primero contra terminosOptica.
 */

export interface ConceptoOptico {
  categoria: "especialidad" | "servicio" | "producto" | "sintoma" | "patologia" | "poblacion" | "seguro";
  terminosOptica: string[];     // PRIORIDAD 1: Lo que las ópticas registran
  terminosClinicos: string[];   // PRIORIDAD 2: Respaldo médico
  sinonimos: string[];          // Lo que el paciente escribe
}

export const CONCEPTS_MAP: Record<string, ConceptoOptico> = {
  // ═══════════════════════════════════════════════════════════════
  // DIABETES Y RETINA
  // ═══════════════════════════════════════════════════════════════
  diabetes: {
    categoria: "patologia",
    terminosOptica: ["Consulta de diabetes", "Diabetes", "Paciente diabético", "Atención a diabéticos", "Control visual para diabéticos"],
    terminosClinicos: ["Retinopatía diabética", "Fondo de ojo", "OCT", "Angiografía fluoresceínica"],
    sinonimos: ["soy diabético", "tengo diabetes", "diabético", "azúcar en la sangre", "me afecta la diabetes en la vista", "necesito revisión por diabetes"],
  },
  ojo_seco: {
    categoria: "patologia",
    terminosOptica: ["Ojo seco", "Tratamiento de ojo seco", "Consulta de ojo seco", "Síndrome de ojo seco", "Lágrimas artificiales"],
    terminosClinicos: ["Queratoconjuntivitis seca", "Disfunción de glándulas de Meibomio"],
    sinonimos: ["ojos secos", "me arden los ojos", "sensación de arena", "lagrimeo constante", "picazón en los ojos", "ardor", "resequedad", "ojos irritados", "me molesta el sol", "ojos cansados"],
  },
  retina: {
    categoria: "patologia",
    terminosOptica: ["Revisión de retina", "Fondo de ojo", "Evaluación de retina"],
    terminosClinicos: ["Desprendimiento de retina", "Degeneración macular", "DMAE"],
    sinonimos: ["moscas volantes", "puntitos negros", "telarañas en la vista", "manchas flotantes", "veo como niebla", "mancha en el centro"],
  },

  // ═══════════════════════════════════════════════════════════════
  // ERRORES DE REFRACCIÓN
  // ═══════════════════════════════════════════════════════════════
  miopia: {
    categoria: "patologia",
    terminosOptica: ["Miopía", "Examen de la Vista", "Optometría General", "Lentes para miopía"],
    terminosClinicos: ["Error refractivo"],
    sinonimos: ["no veo de lejos", "veo borroso de lejos", "miope", "no alcanzo el pizarrón", "vista corta"],
  },
  hipermetropia: {
    categoria: "patologia",
    terminosOptica: ["Hipermetropía", "Examen de la Vista", "Lentes para hipermetropía"],
    terminosClinicos: ["Error refractivo hipermetrópico"],
    sinonimos: ["no veo de cerca", "veo borroso de cerca", "hipermétrope", "me cuesta leer"],
  },
  astigmatismo: {
    categoria: "patologia",
    terminosOptica: ["Astigmatismo", "Lentes para astigmatismo", "Lentes tóricos"],
    terminosClinicos: ["Error refractivo astigmático"],
    sinonimos: ["veo las letras borrosas", "veo doble de noche", "astigmático", "veo las luces con halo"],
  },
  presbicia: {
    categoria: "patologia",
    terminosOptica: ["Presbicia", "Lentes Progresivos", "Lentes Multifocales", "Lentes para leer"],
    terminosClinicos: ["Vista cansada", "Presbicia senil"],
    sinonimos: ["no puedo leer de cerca", "alejo el celular para leer", "vista cansada", "tengo 40 años y ya no leo", "tengo 50 años", "tengo 60 años", "tengo 70 años", "tengo 80 años", "letras muy chicas", "letra pequeña"],
  },

  // ═══════════════════════════════════════════════════════════════
  // PRODUCTOS Y LENTES
  // ═══════════════════════════════════════════════════════════════
  progresivos: {
    categoria: "producto",
    terminosOptica: ["Lentes Progresivos", "Progresivos", "Lentes Multifocales", "Varilux"],
    terminosClinicos: ["Lentes multifocales progresivos"],
    sinonimos: ["lentes para leer y ver de lejos", "lentes sin línea", "lentes de doble uso", "todas las distancias", "cambiar de enfoque"],
  },
  contacto: {
    categoria: "producto",
    terminosOptica: ["Lentes de Contacto", "Contactología", "Adaptación de lentes de contacto", "Lentes de contacto diarios", "Lentes de contacto mensuales"],
    terminosClinicos: ["Lentes de contacto blandos", "Lentes de contacto rígidos"],
    sinonimos: ["lentillas", "no quiero armazón", "lentes invisibles", "lentes desechables", "lentes de color"],
  },
  antiblue: {
    categoria: "producto",
    terminosOptica: ["Lentes Antiblue", "Lentes para Computadora", "Filtro de Luz Azul", "Lentes Blue Cut"],
    terminosClinicos: ["Filtro de luz azul de alta energía"],
    sinonimos: ["lentes para computadora", "lentes para pantalla", "luz azul", "me cansa la laptop", "trabajo en oficina", "programador", "gamer", "home office", "fatiga visual digital"],
  },
  solares: {
    categoria: "producto",
    terminosOptica: ["Lentes Solares", "Lentes Polarizados", "Lentes con graduación solar", "Lentes UV400"],
    terminosClinicos: ["Protección ultravioleta"],
    sinonimos: ["lentes de sol", "lentes oscuros", "para manejar", "para la playa", "me molesta el sol"],
  },
  fotocromaticos: {
    categoria: "producto",
    terminosOptica: ["Lentes Fotocromáticos", "Lentes Transitions", "Lentes inteligentes"],
    terminosClinicos: ["Lentes foto-sensibles"],
    sinonimos: ["se oscurecen con el sol", "cambian de color", "para interior y exterior"],
  },
  deportivos: {
    categoria: "producto",
    terminosOptica: ["Lentes Deportivos", "Lentes para deporte con graduación"],
    terminosClinicos: [],
    sinonimos: ["para correr", "para bicicleta", "para el gym", "para fútbol", "para nadar", "soy deportista"],
  },

  // ═══════════════════════════════════════════════════════════════
  // SERVICIOS CLÍNICOS
  // ═══════════════════════════════════════════════════════════════
  examen_vista: {
    categoria: "servicio",
    terminosOptica: ["Examen de la Vista", "Optometría General", "Evaluación visual", "Chequeo visual"],
    terminosClinicos: ["Examen refractivo completo"],
    sinonimos: ["chequeo", "revisión", "medir la vista", "graduación", "necesito saber mi graduación", "cita para examen"],
  },
  pediatrica: {
    categoria: "servicio",
    terminosOptica: ["Oftalmología Pediátrica", "Optometría Infantil", "Examen para niños", "Lentes para niños"],
    terminosClinicos: ["Estrabismo infantil", "Ambliopía"],
    sinonimos: ["para niños", "mi hijo", "para bebé", "no ve en la escuela", "se acerca mucho a la tele", "pediatra de ojos"],
  },
  glaucoma: {
    categoria: "patologia",
    terminosOptica: ["Glaucoma", "Tonometría", "Presión ocular", "Medición de presión"],
    terminosClinicos: ["Campimetría", "OCT de nervio óptico"],
    sinonimos: ["presión alta en los ojos", "pérdida de visión lateral", "me dijeron que tengo presión ocular"],
  },
  cataratas: {
    categoria: "patologia",
    terminosOptica: ["Cataratas", "Evaluación de cataratas", "Lentes intraoculares"],
    terminosClinicos: ["Cirugía de facoemulsificación"],
    sinonimos: ["veo con niebla", "todo opaco", "colores apagados", "nube en el ojo", "me deslumbro mucho"],
  },
  baja_vision: {
    categoria: "servicio",
    terminosOptica: ["Baja Visión", "Ayudas ópticas", "Lupas especiales"],
    terminosClinicos: ["Rehabilitación visual"],
    sinonimos: ["veo muy poco", "casi no veo", "ayudas visuales", "lupas especiales"],
  },
  terapia_visual: {
    categoria: "servicio",
    terminosOptica: ["Terapia Visual", "Ejercicios oculares", "Ortóptica"],
    terminosClinicos: ["Rehabilitación visual funcional"],
    sinonimos: ["ojos chuecos", "bizco", "ojo desviado", "ejercicios para los ojos"],
  },

  // ═══════════════════════════════════════════════════════════════
  // SÍNTOMAS (sin diagnóstico claro)
  // ═══════════════════════════════════════════════════════════════
  dolor_cabeza_visual: {
    categoria: "sintoma",
    terminosOptica: ["Examen de la Vista", "Lentes Progresivos", "Lentes para Computadora", "Optometría General"],
    terminosClinicos: ["Cefalea tensional visual", "Asthenopia"],
    sinonimos: ["me duele la cabeza al leer", "dolor de cabeza al usar computadora", "dolor de cabeza al final del día", "me duele la frente"],
  },
  fatiga_visual: {
    categoria: "sintoma",
    terminosOptica: ["Lentes Antiblue", "Lentes para Computadora", "Examen de la Vista"],
    terminosClinicos: ["Síndrome visual informático"],
    sinonimos: ["me canso la vista", "ojos cansados", "me pesan los ojos", "vista cansada"],
  },
  ojo_rojo: {
    categoria: "sintoma",
    terminosOptica: ["Ojo seco", "Conjuntivitis", "Consulta de ojo rojo"],
    terminosClinicos: ["Inyección conjuntival"],
    sinonimos: ["ojos rojos", "conjuntivitis", "ojo irritado", "legañas", "ojo pegado"],
  },

  // ═══════════════════════════════════════════════════════════════
  // SEGUROS (México)
  // ═══════════════════════════════════════════════════════════════
  gnp: { categoria: "seguro", terminosOptica: ["GNP", "GNP Seguros", "Seguro GNP"], terminosClinicos: [], sinonimos: ["gnp", "seguro gnp", "tengo gnp"] },
  axa: { categoria: "seguro", terminosOptica: ["AXA", "AXA Seguros", "Seguro AXA"], terminosClinicos: [], sinonimos: ["axa", "seguro axa", "tengo axa"] },
  metlife: { categoria: "seguro", terminosOptica: ["MetLife", "Seguro MetLife"], terminosClinicos: [], sinonimos: ["metlife", "met life"] },
  auna: { categoria: "seguro", terminosOptica: ["AUNA", "Seguro AUNA"], terminosClinicos: [], sinonimos: ["auna", "seguro auna"] },
  monterrey: { categoria: "seguro", terminosOptica: ["Seguros Monterrey", "Monterrey"], terminosClinicos: [], sinonimos: ["la monterrey", "seguro monterrey"] },
  zurich: { categoria: "seguro", terminosOptica: ["Zurich", "Zurich Seguros"], terminosClinicos: [], sinonimos: ["zurich"] },
  allianz: { categoria: "seguro", terminosOptica: ["Allianz", "Seguro Allianz"], terminosClinicos: [], sinonimos: ["allianz"] },
  mapfre: { categoria: "seguro", terminosOptica: ["Mapfre", "Seguro Mapfre"], terminosClinicos: [], sinonimos: ["mapfre"] },
  inbursa: { categoria: "seguro", terminosOptica: ["Inbursa", "Seguro Inbursa"], terminosClinicos: [], sinonimos: ["inbursa"] },

  // ═══════════════════════════════════════════════════════════════
  // POBLACIONES
  // ═══════════════════════════════════════════════════════════════
  adulto_mayor: {
    categoria: "poblacion",
    terminosOptica: ["Lentes Progresivos", "Presbicia", "Examen de la Vista", "Cataratas"],
    terminosClinicos: ["Presbicia senil", "Catarata senil"],
    sinonimos: ["mi papá", "mi mamá", "mi abuela", "mi abuelo", "adulto mayor", "tercera edad", "tengo 70 años", "tengo 80 años"],
  },
};

/**
 * Expande una consulta del usuario.
 * 
 * IMPORTANTE: Esta función ahora separa los términos por prioridad.
 * - terminosOptica: SIEMPRE se usan primero (lo que las ópticas registran)
 * - terminosClinicos: Solo como respaldo si no hay match
 */
export function expandirConsulta(query: string): {
  terminosOptica: string[];
  terminosClinicos: string[];
  todos: string[];
} {
  const queryLower = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const terminosOptica = new Set<string>([query]);
  const terminosClinicos = new Set<string>();

  for (const [key, concepto] of Object.entries(CONCEPTS_MAP)) {
    const match = concepto.sinonimos.some((sinonimo) => {
      const sinonimoNormalizado = sinonimo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return queryLower.includes(sinonimoNormalizado) || sinonimoNormalizado.includes(queryLower);
    }) || queryLower.includes(key);

    if (match) {
      concepto.terminosOptica.forEach((t) => terminosOptica.add(t));
      concepto.terminosClinicos.forEach((t) => terminosClinicos.add(t));
    }
  }

  return {
    terminosOptica: Array.from(terminosOptica),
    terminosClinicos: Array.from(terminosClinicos),
    todos: Array.from(new Set([...terminosOptica, ...terminosClinicos])),
  };
}

/**
 * Identifica la categoría principal de una consulta.
 */
export function identificarCategoria(query: string): string | null {
  const queryLower = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const [key, concepto] of Object.entries(CONCEPTS_MAP)) {
    const match = concepto.sinonimos.some((sinonimo) => {
      const sinonimoNormalizado = sinonimo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return queryLower.includes(sinonimoNormalizado);
    }) || queryLower.includes(key);

    if (match) return concepto.categoria;
  }

  return null;
}