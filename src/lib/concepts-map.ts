/**
 * DICCIONARIO DE CONCEPTOS ÓPTICOS (FRANKLIN SUPERPODER)
 * 
 * Este archivo mapea el lenguaje natural, síntomas y términos coloquiales 
 * de los pacientes hacia las especialidades, servicios y productos formales 
 * que las ópticas tienen en sus fichas.
 * 
 * Permite la "expansión de consulta": si el usuario busca "me duele la cabeza al leer",
 * Franklin sabe que debe buscar ópticas con "Lentes Progresivos" o "Examen de la Vista".
 */

export interface ConceptoOptico {
  categoria: "especialidad" | "servicio" | "producto" | "sintoma";
  terminosFormales: string[]; // Lo que está en la base de datos de la óptica
  sinonimos: string[];        // Lo que el usuario podría escribir
}

export const CONCEPTS_MAP: Record<string, ConceptoOptico> = {
  // --- VISIÓN Y LENTES ---
  progresivos: {
    categoria: "producto",
    terminosFormales: ["Lentes Progresivos", "Lentes Multifocales", "Progresivos"],
    sinonimos: ["lentes para leer y ver de lejos", "lentes sin línea", "progresivos", "multifocales", "me canso la vista al cambiar de enfoque"],
  },
  antiblue: {
    categoria: "producto",
    terminosFormales: ["Lentes Antiblue", "Filtro de Luz Azul", "Lentes para Computadora"],
    sinonimos: ["lentes para computadora", "lentes para pantalla", "luz azul", "me arden los ojos con el celular", "fatiga visual digital"],
  },
  contacto: {
    categoria: "producto",
    terminosFormales: ["Lentes de Contacto", "Lentes de Contacto Mensuales", "Lentes de Contacto Diarios"],
    sinonimos: ["lentes de contacto", "lentillas", "no quiero usar armazón", "lentes invisibles"],
  },
  sol: {
    categoria: "producto",
    terminosFormales: ["Lentes Solares", "Lentes con Graduación Solar", "Lentes Polarizados"],
    sinonimos: ["lentes de sol", "lentes oscuros", "lentes polarizados", "lentes para el sol con mi graduación"],
  },

  // --- CONDICIONES Y SÍNTOMAS ---
  ojo_seco: {
    categoria: "sintoma",
    terminosFormales: ["Ojo seco", "Consulta de ojo seco", "Tratamiento de ojo seco"],
    sinonimos: ["ojos secos", "ojos rojos", "sensación de arena en los ojos", "lagrimeo constante", "ardor en los ojos"],
  },
  diabetes: {
    categoria: "sintoma",
    terminosFormales: ["Consulta de diabetes", "Fondo de ojo", "Retinopatía diabética"],
    sinonimos: ["diabetes", "diabético", "azúcar en la sangre", "revisión por diabetes"],
  },
  miopia: {
    categoria: "sintoma",
    terminosFormales: ["Miopía", "Optometría General", "Examen de la Vista"],
    sinonimos: ["no veo bien de lejos", "veo borroso de lejos", "miopía"],
  },
  infantil: {
    categoria: "servicio",
    terminosFormales: ["Optometría Pediátrica", "Examen de la Vista Infantil", "Control visual infantil"],
    sinonimos: ["para niños", "pediatra de ojos", "mi hijo no ve bien", "lentes para niños", "ortóptica"],
  },

  // --- SEGUROS Y SERVICIOS ---
  gnp: {
    categoria: "servicio",
    terminosFormales: ["GNP Seguros", "Seguro GNP", "Gastos Médicos GNP"],
    sinonimos: ["gnp", "seguro gnp", "gastos médicos gnp"],
  },
  axa: {
    categoria: "servicio",
    terminosFormales: ["AXA Seguros", "Seguro AXA", "Gastos Médicos AXA"],
    sinonimos: ["axa", "seguro axa"],
  },
  mapa: {
    categoria: "servicio",
    terminosFormales: ["Topografía Corneal", "Mapa Corneal", "Queratocono"],
    sinonimos: ["mapa de la cornea", "topografia", "queratocono"],
  }
};

/**
 * Expande una consulta del usuario añadiendo los términos formales asociados.
 * Ejemplo: "tengo ojo seco" -> ["ojo seco", "Ojo seco", "Consulta de ojo seco", "Tratamiento de ojo seco"]
 */
export function expandirConsulta(query: string): string[] {
  const queryLower = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const terminosExpandidos = new Set<string>([query]); // Siempre incluir la consulta original

  for (const [key, concepto] of Object.entries(CONCEPTS_MAP)) {
    // Verificar si algún sinónimo o el nombre del concepto está en la consulta
    const match = concepto.sinonimos.some((sinonimo) => {
      const sinonimoNormalizado = sinonimo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return queryLower.includes(sinonimoNormalizado) || sinonimoNormalizado.includes(queryLower);
    }) || queryLower.includes(key);

    if (match) {
      // Agregar todos los términos formales a la búsqueda
      concepto.terminosFormales.forEach((termino) => terminosExpandidos.add(termino));
    }
  }

  return Array.from(terminosExpandidos);
}