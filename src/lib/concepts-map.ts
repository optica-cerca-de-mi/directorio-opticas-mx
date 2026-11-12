/**
 * DICCIONARIO DE CONCEPTOS ÓPTICOS - VERSIÓN CLÍNICA EXPANDIDA
 * 
 * Basado en:
 * - CIE-10 Capítulo VII: Enfermedades del ojo y sus anexos (H00-H59)
 * - SNOMED CT Subconjunto de Oftalmología y Optometría
 * - MeSH (Medical Subject Headings) - Eye Diseases
 * - Terminología clínica de la Asociación Mexicana de Optometría
 * 
 * Permite la expansión semántica: el paciente escribe en lenguaje coloquial,
 * Franklin busca en términos clínicos formales que las ópticas tienen registrados.
 */

export interface ConceptoOptico {
  categoria: "especialidad" | "servicio" | "producto" | "sintoma" | "patologia" | "poblacion" | "seguro";
  terminosFormales: string[]; // Lo que está en la base de datos de la óptica
  sinonimos: string[];        // Lo que el paciente podría escribir (lenguaje layman)
}

export const CONCEPTS_MAP: Record<string, ConceptoOptico> = {
  // ═══════════════════════════════════════════════════════════════
  // ERRORES DE REFRACCIÓN (CIE-10 H52)
  // ═══════════════════════════════════════════════════════════════
  miopia: {
    categoria: "patologia",
    terminosFormales: ["Miopía", "Optometría General", "Examen de la Vista", "Lentes para miopía"],
    sinonimos: ["no veo bien de lejos", "veo borroso de lejos", "miopía", "miope", "no alcanzo a leer el pizarrón", "no veo los letreros de lejos", "vista corta"],
  },
  hipermetropia: {
    categoria: "patologia",
    terminosFormales: ["Hipermetropía", "Examen de la Vista", "Lentes para hipermetropía"],
    sinonimos: ["no veo bien de cerca", "veo borroso de cerca", "hipermetropía", "hipermétrope", "me cuesta leer de cerca", "vista larga"],
  },
  astigmatismo: {
    categoria: "patologia",
    terminosFormales: ["Astigmatismo", "Examen de la Vista", "Lentes para astigmatismo", "Lentes tóricos"],
    sinonimos: ["veo las letras borrosas", "veo las luces con halo", "astigmatismo", "astigmático", "veo doble de noche", "las letras se ven movidas"],
  },
  presbicia: {
    categoria: "patologia",
    terminosFormales: ["Presbicia", "Lentes Progresivos", "Lentes Multifocales", "Lentes para leer", "Examen de la Vista"],
    sinonimos: ["no puedo leer de cerca", "tengo que alejar el celular para leer", "vista cansada", "presbicia", "presbíope", "me canso la vista al leer", "tengo 40 años y ya no leo bien", "necesito lentes para leer"],
  },
  progresivos: {
    categoria: "producto",
    terminosFormales: ["Lentes Progresivos", "Lentes Multifocales", "Progresivos", "Lentes Varilux"],
    sinonimos: ["lentes para leer y ver de lejos", "lentes sin línea", "progresivos", "multifocales", "lentes de doble uso", "lentes para todas las distancias", "me canso al cambiar de enfoque", "lentes para la computadora y para lejos"],
  },

  // ═══════════════════════════════════════════════════════════════
  // PATOLOGÍAS OCULARES (CIE-10 H00-H59)
  // ═══════════════════════════════════════════════════════════════
  ojo_seco: {
    categoria: "patologia",
    terminosFormales: ["Ojo seco", "Consulta de ojo seco", "Tratamiento de ojo seco", "Síndrome de ojo seco"],
    sinonimos: ["ojos secos", "ojos rojos", "sensación de arena en los ojos", "lagrimeo constante", "ardor en los ojos", "picazón en los ojos", "ojo irritado", "ojos cansados", "sensación de cuerpo extraño"],
  },
  glaucoma: {
    categoria: "patologia",
    terminosFormales: ["Glaucoma", "Tonometría", "Medición de presión ocular", "Campimetría", "OCT"],
    sinonimos: ["presión alta en los ojos", "glaucoma", "me dijeron que tengo presión ocular alta", "pérdida de visión lateral", "glaucoma角"],
  },
  cataratas: {
    categoria: "patologia",
    terminosFormales: ["Cataratas", "Evaluación de cataratas", "Cirugía de cataratas", "Lentes intraoculares"],
    sinonimos: ["cataratas", "veo como con niebla", "veo todo opaco", "los colores se ven apagados", "me deslumbro con la luz", "tengo una nube en el ojo", "vista nublada"],
  },
  degeneracion_macular: {
    categoria: "patologia",
    terminosFormales: ["Degeneración Macular", "DMAE", "OCT Macular", "Fondo de ojo", "Retina"],
    sinonimos: ["degeneración macular", "mancha en el centro de la vista", "veo ondulado el centro", "dmae", "problema de retina", "no veo bien el centro", "las líneas rectas se ven onduladas"],
  },
  diabetes_ocular: {
    categoria: "patologia",
    terminosFormales: ["Consulta de diabetes", "Fondo de ojo", "Retinopatía diabética", "OCT", "Angiografía fluoresceínica"],
    sinonimos: ["diabetes", "diabético", "azúcar en la sangre", "revisión por diabetes", "retinopatía", "tengo diabetes y necesito revisar mis ojos", "me afecta la diabetes en la vista"],
  },
  queratocono: {
    categoria: "patologia",
    terminosFormales: ["Queratocono", "Topografía Corneal", "Mapa Corneal", "Lentes esclerales", "Cross-linking"],
    sinonimos: ["queratocono", "mapa de la córnea", "topografía corneal", "córnea deformada", "lentes especiales para córnea irregular", "me dijeron que tengo la córnea rara"],
  },
  conjuntivitis: {
    categoria: "patologia",
    terminosFormales: ["Conjuntivitis", "Consulta de ojo rojo", "Tratamiento de conjuntivitis"],
    sinonimos: ["conjuntivitis", "ojo rojo", "ojo lloroso", "legañas", "ojo pegado", "infección en el ojo"],
  },
  orzuelo: {
    categoria: "patologia",
    terminosFormales: ["Orzuelo", "Blefaritis", "Consulta de párpados"],
    sinonimos: ["orzuelo", "grano en el párpado", "párpado inflamado", "blefaritis", "ojo hinchado"],
  },
  estrabismo: {
    categoria: "patologia",
    terminosFormales: ["Estrabismo", "Ortóptica", "Terapia Visual", "Ejercicios oculares"],
    sinonimos: ["estrabismo", "ojos chuecos", "ojo desviado", "bizco", "ojos no alineados", "terapia para alinear los ojos"],
  },
  ambliopia: {
    categoria: "patologia",
    terminosFormales: ["Ambliopía", "Ojo perezoso", "Terapia Visual", "Oclusión"],
    sinonimos: ["ambliopía", "ojo perezoso", "ojo flojo", "un ojo ve menos", "ojo tapado de chico"],
  },
  fotofobia: {
    categoria: "sintoma",
    terminosFormales: ["Fotofobia", "Lentes con filtro UV", "Lentes fotocromáticos", "Lentes oscuros"],
    sinonimos: ["me molesta la luz", "fotofobia", "no puedo ver con el sol", "me deslumbro", "los ojos me lloran con la luz"],
  },
  vision_doble: {
    categoria: "sintoma",
    terminosFormales: ["Diplopía", "Visión doble", "Examen binocular", "Ortóptica"],
    sinonimos: ["veo doble", "diplopía", "veo las cosas duplicadas", "dos imágenes"],
  },
  moscas_volantes: {
    categoria: "sintoma",
    terminosFormales: ["Miodesopsias", "Moscas volantes", "Fondo de ojo", "Desprendimiento de retina"],
    sinonimos: ["moscas volantes", "puntitos negros en la vista", "telarañas en el ojo", "manchas flotantes", "veo puntos negros"],
  },
  halos_luminosos: {
    categoria: "sintoma",
    terminosFormales: ["Halos luminosos", "Deslumbramiento", "Examen de refracción"],
    sinonimos: ["halos alrededor de las luces", "veo aros de luz", "me deslumbro de noche", "halos en faros de autos"],
  },

  // ═══════════════════════════════════════════════════════════════
  // PRODUCTOS Y LENTES
  // ═══════════════════════════════════════════════════════════════
  lentes_contacto: {
    categoria: "producto",
    terminosFormales: ["Lentes de Contacto", "Lentes de Contacto Mensuales", "Lentes de Contacto Diarios", "Adaptación de lentes de contacto", "Lentes tóricos de contacto"],
    sinonimos: ["lentes de contacto", "lentillas", "no quiero usar armazón", "lentes invisibles", "lentes suaves", "lentes desechables", "lentes para un mes", "lentes de color"],
  },
  lentes_contacto_toricos: {
    categoria: "producto",
    terminosFormales: ["Lentes de Contacto Tóricos", "Lentes de contacto para astigmatismo"],
    sinonimos: ["lentes de contacto para astigmatismo", "lentes tóricos", "tengo astigmatismo y quiero lentes de contacto"],
  },
  lentes_multifocales_contacto: {
    categoria: "producto",
    terminosFormales: ["Lentes de Contacto Multifocales", "Lentes de contacto progresivos"],
    sinonimos: ["lentes de contacto para presbicia", "lentes de contacto para leer", "lentes multifocales de contacto"],
  },
  lentes_solares: {
    categoria: "producto",
    terminosFormales: ["Lentes Solares", "Lentes con Graduación Solar", "Lentes Polarizados", "Lentes con UV400"],
    sinonimos: ["lentes de sol", "lentes oscuros", "lentes polarizados", "lentes para el sol con mi graduación", "lentes para manejar de día", "lentes para la playa"],
  },
  lentes_fotocromaticos: {
    categoria: "producto",
    terminosFormales: ["Lentes Fotocromáticos", "Lentes Transitions", "Lentes que oscurecen con el sol", "Lentes inteligentes"],
    sinonimos: ["lentes que se oscurecen con el sol", "lentes transitions", "lentes que cambian de color", "lentes para interior y exterior", "lentes que se adaptan a la luz"],
  },
  lentes_antiblue: {
    categoria: "producto",
    terminosFormales: ["Lentes Antiblue", "Filtro de Luz Azul", "Lentes para Computadora", "Lentes Blue Cut", "Lentes con filtro HEV"],
    sinonimos: ["lentes para computadora", "lentes para pantalla", "luz azul", "me arden los ojos con el celular", "fatiga visual digital", "lentes para el trabajo en oficina", "lentes para gamer", "lentes para programador", "me cansa la vista con la laptop"],
  },
  lentes_deportivos: {
    categoria: "producto",
    terminosFormales: ["Lentes Deportivos", "Lentes para deporte con graduación", "Lentes deportivos polarizados"],
    sinonimos: ["lentes para hacer ejercicio", "lentes para correr", "lentes para bicicleta", "lentes para nadar", "lentes deportivos con graduación", "lentes para el gym"],
  },
  armazones: {
    categoria: "producto",
    terminosFormales: ["Armazones", "Monturas", "Marcos para lentes", "Armazones de diseñador"],
    sinonimos: ["armazones", "monturas", "marcos", "lentes de pasta", "lentes de metal", "marcos de marca", "Ray-Ban", "Oakley"],
  },

  // ═══════════════════════════════════════════════════════════════
  // SERVICIOS CLÍNICOS
  // ═══════════════════════════════════════════════════════════════
  examen_vista: {
    categoria: "servicio",
    terminosFormales: ["Examen de la Vista", "Examen Visual Completo", "Optometría General", "Evaluación refractiva"],
    sinonimos: ["examen de la vista", "chequeo visual", "revisión de la vista", "medir la vista", "graduación de lentes", "necesito saber mi graduación", "cita para examen visual"],
  },
  optometria_pediatrica: {
    categoria: "servicio",
    terminosFormales: ["Optometría Pediátrica", "Examen de la Vista Infantil", "Control visual infantil", "Primera revisión visual del niño"],
    sinonimos: ["para niños", "pediatra de ojos", "mi hijo no ve bien", "lentes para niños", "examen para niños", "revisión visual para bebé", "mi hijo se acerca mucho a la tele", "mi hijo se queja de la vista", "control visual escolar"],
  },
  terapia_visual: {
    categoria: "servicio",
    terminosFormales: ["Terapia Visual", "Rehabilitación Visual", "Ejercicios oculares", "Ortóptica"],
    sinonimos: ["terapia visual", "ejercicios para los ojos", "rehabilitación visual", "entrenamiento visual", "mejorar la coordinación de los ojos"],
  },
  ortoqueratologia: {
    categoria: "servicio",
    terminosFormales: ["Ortoqueratología", "Lentes nocturnos", "Lentes de moldeado corneal", "Ortho-K"],
    sinonimos: ["ortoqueratología", "lentes nocturnos", "lentes para dormir", "ortho-k", "lentes que corrigen la miopía mientras duermo", "no quiero lentes de día"],
  },
  baja_vision: {
    categoria: "servicio",
    terminosFormales: ["Baja Visión", "Ayudas ópticas para baja visión", "Lupas especiales", "Telescopios para baja visión"],
    sinonimos: ["baja visión", "veo muy poco", "casi no veo", "necesito ayudas visuales", "lupas especiales", "ayudas para ver mejor"],
  },
  lentes_intraoculares: {
    categoria: "servicio",
    terminosFormales: ["Lentes Intraoculares", "LIO", "Cirugía refractiva", "Implante de lente"],
    sinonimos: ["lentes intraoculares", "cirugía para quitar lentes", "operación de la vista", "lasik", "implante de lente", "quiero dejar de usar lentes"],
  },
  fondo_ojo: {
    categoria: "servicio",
    terminosFormales: ["Fondo de ojo", "Retinografía", "OCT", "Evaluación de retina"],
    sinonimos: ["fondo de ojo", "revisión de retina", "oct", "retinografía", "revisión del nervio óptico"],
  },
  campimetria: {
    categoria: "servicio",
    terminosFormales: ["Campimetría", "Campo visual", "Perimetría computarizada"],
    sinonimos: ["campo visual", "campimetría", "revisión del campo visual", "perimetría"],
  },
  topografia_corneal: {
    categoria: "servicio",
    terminosFormales: ["Topografía Corneal", "Mapa Corneal", "Paquimetría"],
    sinonimos: ["mapa de la córnea", "topografía", "paquimetría", "medición de córnea"],
  },
  tonometria: {
    categoria: "servicio",
    terminosFormales: ["Tonometría", "Medición de presión intraocular", "Presión ocular"],
    sinonimos: ["presión del ojo", "tonometría", "medir la presión ocular", "revisión de glaucoma"],
  },

  // ═══════════════════════════════════════════════════════════════
  // POBLACIONES ESPECÍFICAS
  // ═══════════════════════════════════════════════════════════════
  adultos_mayores: {
    categoria: "poblacion",
    terminosFormales: ["Optometría Geriátrica", "Atención visual al adulto mayor", "Lentes para presbicia", "Evaluación de cataratas"],
    sinonimos: ["para adultos mayores", "para la abuela", "para mi papá", "lentes para viejitos", "vista para tercera edad", "tengo 60 años", "tengo 70 años", "vista cansada por la edad"],
  },
  deportistas: {
    categoria: "poblacion",
    terminosFormales: ["Lentes Deportivos", "Lentes para deporte con graduación", "Lentes de contacto deportivos"],
    sinonimos: ["soy deportista", "lentes para correr", "lentes para ciclismo", "lentes para fútbol", "lentes para natación", "lentes para el gym"],
  },
  trabajadores_oficina: {
    categoria: "poblacion",
    terminosFormales: ["Lentes para Computadora", "Lentes Antiblue", "Lentes ocupacionales", "Lentes para trabajo cercano"],
    sinonimos: ["trabajo en oficina", "uso mucho la computadora", "soy programador", "trabajo con pantallas", "lentes para el trabajo", "me cansa la vista en la oficina", "lentes para home office"],
  },
  estudiantes: {
    categoria: "poblacion",
    terminosFormales: ["Examen de la Vista", "Lentes para lectura", "Lentes para computadora"],
    sinonimos: ["soy estudiante", "no veo el pizarrón", "lentes para la escuela", "mi hijo no ve en la escuela", "lentes para estudiar"],
  },

  // ═══════════════════════════════════════════════════════════════
  // SEGUROS Y CONVENIOS (México)
  // ═══════════════════════════════════════════════════════════════
  gnp: {
    categoria: "seguro",
    terminosFormales: ["GNP Seguros", "Seguro GNP", "Gastos Médicos GNP", "Aceptamos GNP"],
    sinonimos: ["gnp", "seguro gnp", "gastos médicos gnp", "tengo gnp"],
  },
  axa: {
    categoria: "seguro",
    terminosFormales: ["AXA Seguros", "Seguro AXA", "Gastos Médicos AXA", "Aceptamos AXA"],
    sinonimos: ["axa", "seguro axa", "tengo axa"],
  },
  metlife: {
    categoria: "seguro",
    terminosFormales: ["MetLife", "Seguro MetLife", "Aceptamos MetLife"],
    sinonimos: ["metlife", "met life", "seguro metlife"],
  },
  auna: {
    categoria: "seguro",
    terminosFormales: ["AUNA", "Seguro AUNA", "Aceptamos AUNA"],
    sinonimos: ["auna", "seguro auna"],
  },
  monterrey: {
    categoria: "seguro",
    terminosFormales: ["Seguros Monterrey", "Aceptamos Seguros Monterrey"],
    sinonimos: ["seguros monterrey", "la monterrey", "seguro monterrey new york life"],
  },
  zurich: {
    categoria: "seguro",
    terminosFormales: ["Zurich Seguros", "Aceptamos Zurich"],
    sinonimos: ["zurich", "seguro zurich"],
  },
  allianz: {
    categoria: "seguro",
    terminosFormales: ["Allianz", "Seguro Allianz", "Aceptamos Allianz"],
    sinonimos: ["allianz", "seguro allianz"],
  },
  imss: {
    categoria: "seguro",
    terminosFormales: ["IMSS", "Seguro Social", "Subrogación IMSS"],
    sinonimos: ["imss", "seguro social", "subrogación", "cita por el seguro social"],
  },
  issste: {
    categoria: "seguro",
    terminosFormales: ["ISSSTE", "Seguro ISSSTE"],
    sinonimos: ["issste", "seguro del estado", "trabajador del gobierno"],
  },

  // ═══════════════════════════════════════════════════════════════
  // SÍNTOMAS Y SEÑALES DE ALARMA
  // ═══════════════════════════════════════════════════════════════
  dolor_cabeza_visual: {
    categoria: "sintoma",
    terminosFormales: ["Cefalea tensional visual", "Examen de la Vista", "Lentes Progresivos", "Lentes para computadora"],
    sinonimos: ["me duele la cabeza", "dolor de cabeza al leer", "dolor de cabeza al usar la computadora", "cefalea visual", "me duele la frente después de leer", "dolor de cabeza al final del día"],
  },
  fatiga_visual: {
    categoria: "sintoma",
    terminosFormales: ["Fatiga Visual", "Asthenopia", "Lentes Antiblue", "Lentes para computadora"],
    sinonimos: ["me canso la vista", "fatiga visual", "ojos cansados", "me arden los ojos", "vista cansada", "me pesan los ojos", "síndrome visual informático"],
  },
  lagrimeo: {
    categoria: "sintoma",
    terminosFormales: ["Epífora", "Ojo seco", "Obstrucción de vía lagrimal", "Consulta de ojo lloroso"],
    sinonimos: ["me lagrimean los ojos", "ojos llorosos", "lagrimeo constante", "tengo los ojos aguados"],
  },
  picazon_ocular: {
    categoria: "sintoma",
    terminosFormales: ["Prurito ocular", "Conjuntivitis alérgica", "Ojo seco", "Blefaritis"],
    sinonimos: ["me pican los ojos", "picazón en los ojos", "ojos que pican", "alergia en los ojos"],
  },
  parpados_inflamados: {
    categoria: "sintoma",
    terminosFormales: ["Blefaritis", "Orzuelo", "Calazio", "Consulta de párpados"],
    sinonimos: ["párpado inflamado", "tengo un bulto en el párpado", "orzuelo", "calazio", "ojo hinchado"],
  },
  perdida_vision_subita: {
    categoria: "sintoma",
    terminosFormales: ["Pérdida súbita de visión", "Urgencia oftalmológica", "Oclusión vascular retiniana", "Desprendimiento de retina"],
    sinonimos: ["dejé de ver de repente", "perdí la vista de un ojo", "no veo de un ojo", "urgencia visual", "me tapé un ojo y no veo"],
  },
};

/**
 * Expande una consulta del usuario añadiendo los términos formales asociados.
 * 
 * Ejemplo: 
 *   Input:  "tengo diabetes"
 *   Output: ["tengo diabetes", "Consulta de diabetes", "Fondo de ojo", "Retinopatía diabética", "OCT"]
 * 
 * Esto garantiza que Franklin encuentre ópticas que tengan registrados los términos
 * clínicos formales, aunque el paciente use lenguaje coloquial.
 */
export function expandirConsulta(query: string): string[] {
  const queryLower = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const terminosExpandidos = new Set<string>([query]);

  for (const [key, concepto] of Object.entries(CONCEPTS_MAP)) {
    const match = concepto.sinonimos.some((sinonimo) => {
      const sinonimoNormalizado = sinonimo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return queryLower.includes(sinonimoNormalizado) || sinonimoNormalizado.includes(queryLower);
    }) || queryLower.includes(key);

    if (match) {
      concepto.terminosFormales.forEach((termino) => terminosExpandidos.add(termino));
    }
  }

  return Array.from(terminosExpandidos);
}

/**
 * Identifica la categoría principal de una consulta.
 * Útil para que Franklin sepa qué tipo de respuesta dar.
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

/**
 * Obtiene todos los términos formales asociados a una consulta.
 * Útil para mostrar al usuario "También podrías buscar..."
 */
export function obtenerTerminosRelacionados(query: string): string[] {
  const queryLower = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const relacionados = new Set<string>();

  for (const concepto of Object.values(CONCEPTS_MAP)) {
    const match = concepto.sinonimos.some((sinonimo) => {
      const sinonimoNormalizado = sinonimo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return queryLower.includes(sinonimoNormalizado);
    });

    if (match) {
      concepto.terminosFormales.forEach((t) => relacionados.add(t));
    }
  }

  return Array.from(relacionados);
}