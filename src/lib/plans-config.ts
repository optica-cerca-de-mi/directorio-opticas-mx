/**
 * CONFIGURACIÓN CENTRAL DE PLANES
 * 
 * Este archivo define TODOS los límites, permisos y reglas
 * para cada plan (Gratis, Premium, Premium+).
 * 
 * Es la "fuente de verdad" que usan:
 * - La ficha individual (/opticas/[id])
 * - El diseñador de fichas (/dashboard/[id]/disenar-ficha)
 * - El sistema de upgrade/downgrade automático
 * - El directorio (/opticas)
 */

// ─────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────

export type PlanType = "free" | "premium" | "premium_plus";

export interface PlanLimits {
  // Contenido
  maxCaracteresDescripcion: number;
  maxFotos: number;
  maxVideos: number;
  maxEspecialidades: number;
  maxSeguros: number;
  maxProductosDestacados: number;
  maxMiembrosEquipo: number;
  
  // Personalización
  permiteHeroPersonalizado: boolean;
  permiteColoresMarca: boolean;
  permiteLogoPersonalizado: boolean;
  permitePromociones: boolean;
  
  // Reseñas
  muestraResenasGoogle: boolean;
  maxResenasMostradas: number;
  
  // Botones de acción
  incluyeBotonWhatsApp: boolean;
  incluyeBotonLlamar: boolean;
  incluyeBotonWaze: boolean;
  incluyeBotonMaps: boolean;
  incluyeBotonSitioWeb: boolean;
  incluyeBotonAgendarCita: boolean;
  
  // Visibilidad en directorio
  apareceEnRanking: boolean;
  badgeVerificado: boolean;
  badgePremium: boolean;
}

export interface PlanConfig {
  id: PlanType;
  nombre: string;
  descripcion: string;
  precioMensual: number;
  precioAnual: number;
  limites: PlanLimits;
  puedeEditar: {
    nombreComercial: boolean;
    direccion: boolean;
    telefono: boolean;
    whatsapp: boolean;
    email: boolean;
    horarios: boolean;
    especialidades: boolean;
    seguros: boolean;
    descripcion: boolean;
    fotos: boolean;
    videos: boolean;
    hero: boolean;
    colores: boolean;
    logo: boolean;
    promociones: boolean;
    equipo: boolean;
    productos: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE PLANES
// ─────────────────────────────────────────────────────────────────

export const PLANS_CONFIG: Record<PlanType, PlanConfig> = {
  free: {
    id: "free",
    nombre: "Gratis",
    descripcion: "Ficha básica para comenzar",
    precioMensual: 0,
    precioAnual: 0,
    limites: {
      maxCaracteresDescripcion: 0, // Sin descripción
      maxFotos: 0,
      maxVideos: 0,
      maxEspecialidades: 3,
      maxSeguros: 0,
      maxProductosDestacados: 0,
      maxMiembrosEquipo: 0,
      permiteHeroPersonalizado: false,
      permiteColoresMarca: false,
      permiteLogoPersonalizado: false,
      permitePromociones: false,
      muestraResenasGoogle: false,
      maxResenasMostradas: 0,
      incluyeBotonWhatsApp: false,
      incluyeBotonLlamar: false,
      incluyeBotonWaze: false,
      incluyeBotonMaps: true,
      incluyeBotonSitioWeb: false,
      incluyeBotonAgendarCita: false,
      apareceEnRanking: true,
      badgeVerificado: false,
      badgePremium: false,
    },
    puedeEditar: {
      nombreComercial: false,
      direccion: false,
      telefono: true, // Permitimos editar para que prueben la experiencia
      whatsapp: true,
      email: false,
      horarios: true, // Permitimos editar horarios
      especialidades: true, // Máx 3
      seguros: false,
      descripcion: false,
      fotos: false,
      videos: false,
      hero: false,
      colores: false,
      logo: false,
      promociones: false,
      equipo: false,
      productos: false,
    },
  },

  premium: {
    id: "premium",
    nombre: "Premium",
    descripcion: "Para ópticas que quieren crecer",
    precioMensual: 199,
    precioAnual: 1990,
    limites: {
      maxCaracteresDescripcion: 300,
      maxFotos: 8,
      maxVideos: 0,
      maxEspecialidades: 8,
      maxSeguros: 5,
      maxProductosDestacados: 1,
      maxMiembrosEquipo: 0,
      permiteHeroPersonalizado: false,
      permiteColoresMarca: false,
      permiteLogoPersonalizado: false,
      permitePromociones: false,
      muestraResenasGoogle: true,
      maxResenasMostradas: 3,
      incluyeBotonWhatsApp: true,
      incluyeBotonLlamar: true,
      incluyeBotonWaze: true,
      incluyeBotonMaps: true,
      incluyeBotonSitioWeb: true,
      incluyeBotonAgendarCita: false,
      apareceEnRanking: true,
      badgeVerificado: true,
      badgePremium: true,
    },
    puedeEditar: {
      nombreComercial: true,
      direccion: true,
      telefono: true,
      whatsapp: true,
      email: true,
      horarios: true,
      especialidades: true,
      seguros: true,
      descripcion: true,
      fotos: true,
      videos: false,
      hero: false,
      colores: false,
      logo: false,
      promociones: false,
      equipo: false,
      productos: true,
    },
  },

  premium_plus: {
    id: "premium_plus",
    nombre: "Premium+",
    descripcion: "Máxima visibilidad y herramientas B2B",
    precioMensual: 599,
    precioAnual: 5391,
    limites: {
      maxCaracteresDescripcion: 1000,
      maxFotos: 15,
      maxVideos: 3,
      maxEspecialidades: 999, // Ilimitadas (usamos 999 como "infinito")
      maxSeguros: 999, // Ilimitados
      maxProductosDestacados: 3,
      maxMiembrosEquipo: 5,
      permiteHeroPersonalizado: true,
      permiteColoresMarca: true,
      permiteLogoPersonalizado: true,
      permitePromociones: true,
      muestraResenasGoogle: true,
      maxResenasMostradas: 999, // Todas
      incluyeBotonWhatsApp: true,
      incluyeBotonLlamar: true,
      incluyeBotonWaze: true,
      incluyeBotonMaps: true,
      incluyeBotonSitioWeb: true,
      incluyeBotonAgendarCita: true,
      apareceEnRanking: true,
      badgeVerificado: true,
      badgePremium: true,
    },
    puedeEditar: {
      nombreComercial: true,
      direccion: true,
      telefono: true,
      whatsapp: true,
      email: true,
      horarios: true,
      especialidades: true,
      seguros: true,
      descripcion: true,
      fotos: true,
      videos: true,
      hero: true,
      colores: true,
      logo: true,
      promociones: true,
      equipo: true,
      productos: true,
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// FUNCIONES HELPER
// ─────────────────────────────────────────────────────────────────

/**
 * Obtiene la configuración de un plan específico
 */
export function getPlanConfig(planId: PlanType): PlanConfig {
  return PLANS_CONFIG[planId];
}

/**
 * Verifica si un plan puede editar un campo específico
 */
export function canEditField(planId: PlanType, field: keyof PlanConfig["puedeEditar"]): boolean {
  return PLANS_CONFIG[planId].puedeEditar[field];
}

/**
 * Obtiene el límite máximo de un campo para un plan
 */
export function getLimit(planId: PlanType, limit: keyof PlanLimits): number | boolean {
  return PLANS_CONFIG[planId].limites[limit];
}

/**
 * Valida si un contenido excede los límites del plan
 */
export function validateContent(
  planId: PlanType,
  content: {
    descripcion?: string;
    fotos?: string[];
    videos?: string[];
    especialidades?: string[];
    seguros?: string[];
  }
): { valid: boolean; errors: string[] } {
  const plan = PLANS_CONFIG[planId];
  const errors: string[] = [];

  // Validar descripción
  if (content.descripcion && content.descripcion.length > plan.limites.maxCaracteresDescripcion) {
    errors.push(`La descripción excede el límite de ${plan.limites.maxCaracteresDescripcion} caracteres`);
  }

  // Validar fotos
  if (content.fotos && content.fotos.length > plan.limites.maxFotos) {
    errors.push(`Máximo ${plan.limites.maxFotos} fotos permitidas`);
  }

  // Validar videos
  if (content.videos && content.videos.length > plan.limites.maxVideos) {
    errors.push(`Máximo ${plan.limites.maxVideos} videos permitidos`);
  }

  // Validar especialidades
  if (content.especialidades && content.especialidades.length > plan.limites.maxEspecialidades) {
    errors.push(`Máximo ${plan.limites.maxEspecialidades} especialidades permitidas`);
  }

  // Validar seguros
  if (content.seguros && content.seguros.length > plan.limites.maxSeguros) {
    errors.push(`Máximo ${plan.limites.maxSeguros} seguros permitidos`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Obtiene el orden de planes (de menor a mayor)
 */
export const PLAN_ORDER: PlanType[] = ["free", "premium", "premium_plus"];

/**
 * Compara dos planes y retorna cuál es superior
 * Retorna: -1 si plan1 < plan2, 0 si son iguales, 1 si plan1 > plan2
 */
export function comparePlans(plan1: PlanType, plan2: PlanType): number {
  const index1 = PLAN_ORDER.indexOf(plan1);
  const index2 = PLAN_ORDER.indexOf(plan2);
  return index1 - index2;
}

/**
 * Verifica si un plan es superior a otro
 */
export function isPlanSuperior(plan1: PlanType, plan2: PlanType): boolean {
  return comparePlans(plan1, plan2) > 0;
}

// ─────────────────────────────────────────────────────────────────
// MENSAJES Y TEXTOS
// ────────────────────────────────────────────────────────────────

export const PLAN_MESSAGES = {
  upgrade: {
    title: "Mejora tu plan",
    description: "Desbloquea más funciones y aumenta tu visibilidad",
    cta: "Ver planes",
  },
  limitReached: {
    fotos: (max: number) => `Has alcanzado el límite de ${max} fotos. Mejora tu plan para agregar más.`,
    descripcion: (max: number) => `Has alcanzado el límite de ${max} caracteres. Mejora tu plan para escribir más.`,
    especialidades: (max: number) => `Has alcanzado el límite de ${max} especialidades. Mejora tu plan para agregar más.`,
  },
  featureLocked: (feature: string, planRequired: string) => 
    `${feature} está disponible en el plan ${planRequired}. Mejora tu plan para desbloquearla.`,
};

// ─────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE NOTIFICACIONES
// ────────────────────────────────────────────────────────────────

export const PAYMENT_NOTIFICATIONS = {
  diasAntesVencimiento: [15, 7, 1],
  canales: {
    15: ["email"],
    7: ["email", "whatsapp"],
    1: ["email", "whatsapp", "push"],
    0: ["email"],
  },
  mensajes: {
    15: {
      asunto: "Tu plan vence en 15 días",
      cuerpo: "Renueva tu plan para mantener todas las funciones de tu ficha.",
    },
    7: {
      asunto: "⚠️ Tu plan vence en 7 días",
      cuerpo: "Últimos 7 días. Tu ficha perderá fotos y reseñas si no renuevas.",
    },
    1: {
      asunto: "🚨 Tu plan vence mañana",
      cuerpo: "Mañana tu ficha cambiará al plan Gratis. Renueva ahora para mantener tu visibilidad.",
    },
    0: {
      asunto: "Tu plan ha cambiado a Gratis",
      cuerpo: "Tu plan ha expirado. Mejora tu plan para recuperar todas las funciones.",
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE REVISIÓN AUTOMÁTICA
// ─────────────────────────────────────────────────────────────────

export const AUTO_REVIEW_CONFIG = {
  frecuencia: "diaria", // "diaria", "semanal"
  horaEjecucion: "03:00", // Hora en que se ejecuta la revisión (UTC)
  accionAlVencer: "downgrade_to_free", // "downgrade_to_free", "suspend", "notify_only"
  archivarContenido: true, // Si true, el contenido excedente se archiva (no se borra)
};