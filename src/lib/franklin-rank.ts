/**
 * OPTI RELEVANCE ENGINE
 * 
 * Motor de scoring propietario que calcula la puntuación de cada óptica
 * para alimentar y priorizar los resultados de Franklin.
 * 
 * Fórmula: OptiRelevance Score = Relevancia × Quality Score × Plan Multiplier × Performance
 * 
 * Este archivo es la "fuente de verdad" para el ranking de ópticas en búsquedas inteligentes.
 */

import { PlanType } from "./plans-config";

// ─────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────

export interface OptiRelevanceInput {
  // Datos de la óptica
  id: string;
  plan?: PlanType;
  calificacionGoogle?: number;
  numResenas?: number;
  fechaCreacion?: any;
  
  // Contenido de la ficha
  descripcion?: string;
  especialidades?: string[];
  especialidadesPersonalizadas?: string[];
  segurosAceptados?: string[];
  fotos?: any[];
  logo?: string;
  horarios?: any[];
  bloquesContenido?: any[];
  productosDestacados?: any[];
  promociones?: any[];
  ciudad?: string;
  estado?: string;
  
  // Métricas de engagement (opcional, se pueden poblar desde analytics)
  clicsFicha30d?: number;
  clicsWhatsApp30d?: number;
}

export interface OptiRelevanceResult {
  scoreTotal: number; // 0-1000 (escala expandida para mayor granularidad)
  scoreRelevancia: number; // 0-100
  scoreQuality: number; // 0-100
  scorePerformance: number; // 0-100
  planMultiplier: number; // 1.0, 1.5, 2.0
  desglose: {
    relevancia: {
      especialidadesPersonalizadas: number;
      especialidadesGenericas: number;
      descripcion: number;
      contenidoEnriquecido: number;
      productos: number;
      promociones: number;
      ciudad: number;
    };
    quality: {
      fichaCompleta: number;
      logo: number;
      fotos: number;
      contenidoEnriquecido: number;
      productosDestacados: number;
      promociones: number;
      horarios: number;
    };
    performance: {
      calificacionGoogle: number;
      resenas: number;
      clicsFicha: number;
      clicsWhatsApp: number;
      antiguedad: number;
    };
  };
  sugerencias: string[]; // Acciones para mejorar el score
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTES Y PESOS
// ─────────────────────────────────────────────────────────────────

const PLAN_MULTIPLIERS: Record<PlanType, number> = {
  free: 1.0,
  premium: 1.5,
  premium_plus: 2.0,
};

const UMBRAL_FOTOS_EXCELENTE = 5;
const UMBRAL_BLOQUES_EXCELENTE = 3;
const UMBRAL_RESENAS_EXCELENTE = 10;
const UMBRAL_CLICS_EXCELENTE = 20;

// ─────────────────────────────────────────────────────────────────
// FUNCIONES DE CÁLCULO
// ─────────────────────────────────────────────────────────────────

/**
 * Calcula el score de Relevancia (0-100)
 * Mide qué tan bien coincide la óptica con una búsqueda específica.
 * Si no se proporciona término de búsqueda, devuelve un score base.
 */
export const calcularRelevancia = (
  optica: OptiRelevanceInput,
  terminoBusqueda?: string
): { score: number; desglose: OptiRelevanceResult["desglose"]["relevancia"] } => {
  const desglose = {
    especialidadesPersonalizadas: 0,
    especialidadesGenericas: 0,
    descripcion: 0,
    contenidoEnriquecido: 0,
    productos: 0,
    promociones: 0,
    ciudad: 0,
  };

  if (!terminoBusqueda) {
    // Score base por tener contenido indexable
    if (optica.especialidadesPersonalizadas && optica.especialidadesPersonalizadas.length > 0) {
      desglose.especialidadesPersonalizadas = 40;
    }
    if (optica.especialidades && optica.especialidades.length > 0) {
      desglose.especialidadesGenericas = 20;
    }
    if (optica.descripcion && optica.descripcion.length > 50) {
      desglose.descripcion = 15;
    }
    if (optica.bloquesContenido && optica.bloquesContenido.length > 0) {
      desglose.contenidoEnriquecido = 15;
    }
    if (optica.productosDestacados && optica.productosDestacados.length > 0) {
      desglose.productos = 5;
    }
    if (optica.promociones && optica.promociones.length > 0) {
      desglose.promociones = 5;
    }

    const total = Object.values(desglose).reduce((a, b) => a + b, 0);
    return { score: Math.min(total, 100), desglose };
  }

  // Búsqueda con término específico
  const terminoLower = terminoBusqueda.toLowerCase();
  const normalizar = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const terminoNorm = normalizar(terminoLower);

  // Especialidades personalizadas (peso máximo: 50)
  const coincidePersonalizada = (optica.especialidadesPersonalizadas || []).some((e) =>
    normalizar(e).includes(terminoNorm)
  );
  if (coincidePersonalizada) desglose.especialidadesPersonalizadas = 50;

  // Especialidades genéricas (peso: 20)
  const coincideGenerica = (optica.especialidades || []).some((e) =>
    normalizar(e).includes(terminoNorm)
  );
  if (coincideGenerica) desglose.especialidadesGenericas = 20;

  // Descripción (peso: 10)
  if (optica.descripcion && normalizar(optica.descripcion).includes(terminoNorm)) {
    desglose.descripcion = 10;
  }

  // Contenido enriquecido (peso: 10)
  const coincideContenido = (optica.bloquesContenido || []).some((b: any) => {
    const titulo = b.datos?.titulo || "";
    const contenido = b.datos?.contenido || "";
    return normalizar(titulo).includes(terminoNorm) || normalizar(contenido).includes(terminoNorm);
  });
  if (coincideContenido) desglose.contenidoEnriquecido = 10;

  // Productos (peso: 5)
  const coincideProducto = (optica.productosDestacados || []).some((p: any) =>
    normalizar(p.nombre || "").includes(terminoNorm) || normalizar(p.descripcion || "").includes(terminoNorm)
  );
  if (coincideProducto) desglose.productos = 5;

  // Promociones (peso: 5)
  const coincidePromo = (optica.promociones || []).some((p: any) =>
    normalizar(p.titulo || "").includes(terminoNorm) || normalizar(p.descripcion || "").includes(terminoNorm)
  );
  if (coincidePromo) desglose.promociones = 5;

  // Ciudad (peso: 20) - solo si el término parece una ciudad
  if (optica.ciudad && normalizar(optica.ciudad).includes(terminoNorm)) {
    desglose.ciudad = 20;
  }

  const total = Object.values(desglose).reduce((a, b) => a + b, 0);
  return { score: Math.min(total, 100), desglose };
};

/**
 * Calcula el Quality Score (0-100)
 * Mide la completitud y calidad de la ficha de la óptica.
 */
export const calcularQualityScore = (
  optica: OptiRelevanceInput
): { score: number; desglose: OptiRelevanceResult["desglose"]["quality"] } => {
  const desglose = {
    fichaCompleta: 0,
    logo: 0,
    fotos: 0,
    contenidoEnriquecido: 0,
    productosDestacados: 0,
    promociones: 0,
    horarios: 0,
  };

  // Ficha completa (20 pts) - campos básicos llenos
  const camposBasicos = [
    optica.descripcion,
    optica.ciudad,
    optica.estado,
    optica.especialidades?.length,
    optica.segurosAceptados?.length,
  ];
  const camposLlenos = camposBasicos.filter((c) => c && (typeof c === "number" ? c > 0 : true)).length;
  desglose.fichaCompleta = Math.round((camposLlenos / camposBasicos.length) * 20);

  // Logo (10 pts)
  if (optica.logo) desglose.logo = 10;

  // Fotos (15 pts)
  const numFotos = optica.fotos?.length || 0;
  if (numFotos >= UMBRAL_FOTOS_EXCELENTE) {
    desglose.fotos = 15;
  } else if (numFotos > 0) {
    desglose.fotos = Math.round((numFotos / UMBRAL_FOTOS_EXCELENTE) * 15);
  }

  // Contenido enriquecido (20 pts)
  const numBloques = optica.bloquesContenido?.length || 0;
  if (numBloques >= UMBRAL_BLOQUES_EXCELENTE) {
    desglose.contenidoEnriquecido = 20;
  } else if (numBloques > 0) {
    desglose.contenidoEnriquecido = Math.round((numBloques / UMBRAL_BLOQUES_EXCELENTE) * 20);
  }

  // Productos destacados (10 pts)
  if (optica.productosDestacados && optica.productosDestacados.length > 0) {
    desglose.productosDestacados = 10;
  }

  // Promociones activas (10 pts)
  const promosActivas = (optica.promociones || []).filter((p: any) => p.activa !== false).length;
  if (promosActivas > 0) {
    desglose.promociones = 10;
  }

  // Horarios configurados (15 pts)
  const horariosArray = Array.isArray(optica.horarios) ? optica.horarios : [];
  const horariosConfig = horariosArray.filter((h: any) => !h.cerrado).length;
  if (horariosConfig >= 5) {
    desglose.horarios = 15;
  } else if (horariosConfig > 0) {
    desglose.horarios = Math.round((horariosConfig / 7) * 15);
  }

  const total = Object.values(desglose).reduce((a, b) => a + b, 0);
  return { score: Math.min(total, 100), desglose };
};

/**
 * Calcula el Performance Score (0-100)
 * Mide el historial y engagement de la óptica.
 */
export const calcularPerformance = (
  optica: OptiRelevanceInput
): { score: number; desglose: OptiRelevanceResult["desglose"]["performance"] } => {
  const desglose = {
    calificacionGoogle: 0,
    resenas: 0,
    clicsFicha: 0,
    clicsWhatsApp: 0,
    antiguedad: 0,
  };

  // Calificación Google (hasta 40 pts, proporcional a 5 estrellas)
  if (optica.calificacionGoogle) {
    desglose.calificacionGoogle = Math.round((optica.calificacionGoogle / 5) * 40);
  }

  // Número de reseñas (hasta 20 pts, logarítmico)
  if (optica.numResenas && optica.numResenas > 0) {
    const logResenas = Math.log10(optica.numResenas + 1);
    const logUmbral = Math.log10(UMBRAL_RESENAS_EXCELENTE + 1);
    desglose.resenas = Math.min(Math.round((logResenas / logUmbral) * 20), 20);
  }

  // Clics en ficha últimos 30 días (hasta 15 pts)
  const clicsFicha = optica.clicsFicha30d || 0;
  if (clicsFicha >= UMBRAL_CLICS_EXCELENTE) {
    desglose.clicsFicha = 15;
  } else if (clicsFicha > 0) {
    desglose.clicsFicha = Math.round((clicsFicha / UMBRAL_CLICS_EXCELENTE) * 15);
  }

  // Clics en WhatsApp últimos 30 días (hasta 15 pts)
  const clicsWA = optica.clicsWhatsApp30d || 0;
  if (clicsWA >= UMBRAL_CLICS_EXCELENTE) {
    desglose.clicsWhatsApp = 15;
  } else if (clicsWA > 0) {
    desglose.clicsWhatsApp = Math.round((clicsWA / UMBRAL_CLICS_EXCELENTE) * 15);
  }

  // Antigüedad en el directorio (hasta 10 pts)
  if (optica.fechaCreacion) {
    const fecha = optica.fechaCreacion.toDate ? optica.fechaCreacion.toDate() : new Date(optica.fechaCreacion);
    const diasAntiguedad = Math.floor((Date.now() - fecha.getTime()) / (1000 * 60 * 60 * 24));
    // 10 pts si tiene más de 180 días (6 meses)
    if (diasAntiguedad >= 180) {
      desglose.antiguedad = 10;
    } else if (diasAntiguedad > 0) {
      desglose.antiguedad = Math.round((diasAntiguedad / 180) * 10);
    }
  }

  const total = Object.values(desglose).reduce((a, b) => a + b, 0);
  return { score: Math.min(total, 100), desglose };
};

/**
 * Calcula el Plan Multiplier según el plan de la óptica.
 */
export const getPlanMultiplier = (plan?: PlanType): number => {
  if (!plan) return 1.0;
  return PLAN_MULTIPLIERS[plan] || 1.0;
};

/**
 * Genera sugerencias accionables para mejorar el score.
 */
export const generarSugerencias = (
  optica: OptiRelevanceInput,
  qualityDesglose: OptiRelevanceResult["desglose"]["quality"]
): string[] => {
  const sugerencias: string[] = [];

  if (!optica.logo) {
    sugerencias.push("Agrega el logo de tu óptica para aumentar tu visibilidad.");
  }

  const numFotos = optica.fotos?.length || 0;
  if (numFotos < UMBRAL_FOTOS_EXCELENTE) {
    const faltantes = UMBRAL_FOTOS_EXCELENTE - numFotos;
    sugerencias.push(`Agrega ${faltantes} foto${faltantes > 1 ? "s" : ""} más a tu galería (mínimo ${UMBRAL_FOTOS_EXCELENTE} recomendadas).`);
  }

  const numBloques = optica.bloquesContenido?.length || 0;
  if (numBloques < UMBRAL_BLOQUES_EXCELENTE) {
    const faltantes = UMBRAL_BLOQUES_EXCELENTE - numBloques;
    sugerencias.push(`Agrega ${faltantes} bloque${faltantes > 1 ? "s" : ""} de contenido enriquecido para mejorar tu posicionamiento en Franklin.`);
  }

  if (!optica.productosDestacados || optica.productosDestacados.length === 0) {
    sugerencias.push("Agrega al menos 1 producto destacado para atraer más clientes.");
  }

  if (!optica.promociones || optica.promociones.length === 0) {
    sugerencias.push("Crea una promoción activa para aumentar tu relevancia en búsquedas.");
  }

  const horariosArray = Array.isArray(optica.horarios) ? optica.horarios : [];
const horariosConfig = horariosArray.filter((h: any) => !h.cerrado).length;
  if (horariosConfig < 5) {
    sugerencias.push("Completa tus horarios de atención para todos los días de la semana.");
  }

  if (!optica.descripcion || optica.descripcion.length < 50) {
    sugerencias.push("Escribe una descripción de al menos 50 caracteres para que Franklin te encuentre mejor.");
  }

  if (!optica.especialidadesPersonalizadas || optica.especialidadesPersonalizadas.length === 0) {
    sugerencias.push("Agrega especialidades personalizadas para destacar en búsquedas específicas.");
  }

  return sugerencias;
};

/**
 * FUNCIÓN PRINCIPAL: Calcula el OptiRelevance Score completo de una óptica.
 */
export const calcularOptiRelevance = (
  optica: OptiRelevanceInput,
  terminoBusqueda?: string
): OptiRelevanceResult => {
  const { score: relevancia, desglose: desgloseRelevancia } = calcularRelevancia(optica, terminoBusqueda);
  const { score: quality, desglose: desgloseQuality } = calcularQualityScore(optica);
  const { score: performance, desglose: desglosePerformance } = calcularPerformance(optica);
  const planMultiplier = getPlanMultiplier(optica.plan);

  // Fórmula: (Relevancia + Quality + Performance) × Plan Multiplier
  // Normalizado a escala 0-1000 para mayor granularidad
  const scoreBase = relevancia + quality + performance; // 0-300
  const scoreTotal = Math.round(scoreBase * planMultiplier * (1000 / 300));

  const sugerencias = generarSugerencias(optica, desgloseQuality);

  return {
    scoreTotal: Math.min(scoreTotal, 1000),
    scoreRelevancia: relevancia,
    scoreQuality: quality,
    scorePerformance: performance,
    planMultiplier,
    desglose: {
      relevancia: desgloseRelevancia,
      quality: desgloseQuality,
      performance: desglosePerformance,
    },
    sugerencias,
  };
};

/**
 * Obtiene el nivel visual del score (para mostrar en el Dashboard).
 */
export const getNivelScore = (score: number): { nivel: string; color: string; porcentaje: number } => {
  const porcentaje = Math.round((score / 1000) * 100);
  
  if (porcentaje >= 80) return { nivel: "Excelente", color: "green", porcentaje };
  if (porcentaje >= 60) return { nivel: "Bueno", color: "blue", porcentaje };
  if (porcentaje >= 40) return { nivel: "Regular", color: "amber", porcentaje };
  return { nivel: "Necesita mejora", color: "red", porcentaje };
};