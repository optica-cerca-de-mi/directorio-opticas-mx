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
  maxEspecialidadesPersonalizadas: number;
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
  stripePriceId?: string; // ID del precio en Stripe
  stripeProductId?: string; // ID del producto en Stripe
  limites: PlanLimits;
  puedeEditar: {
    nombreComercial: boolean;
    direccion: boolean;
    telefono: boolean;
    whatsapp: boolean;
    email: boolean;
    horarios: boolean;
    especialidades: boolean;
    especialidadesPersonalizadas: boolean;
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
      maxCaracteresDescripcion: 0,
      maxFotos: 0,
      maxVideos: 0,
      maxEspecialidades: 3,
      maxEspecialidadesPersonalizadas: 0,
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
      telefono: true,
      whatsapp: true,
      email: false,
      horarios: true,
      especialidades: true,
      especialidadesPersonalizadas: false,
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
    descripcion: "Para opticas que quieren crecer",
    precioMensual: 199,
    precioAnual: 1990,
    limites: {
      maxCaracteresDescripcion: 300,
      maxFotos: 8,
      maxVideos: 0,
      maxEspecialidades: 8,
      maxEspecialidadesPersonalizadas: 5,
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
      especialidadesPersonalizadas: true,
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
    descripcion: "Maxima visibilidad y herramientas B2B",
    precioMensual: 599,
    precioAnual: 5391,
    limites: {
      maxCaracteresDescripcion: 1000,
      maxFotos: 15,
      maxVideos: 3,
      maxEspecialidades: 999,
      maxEspecialidadesPersonalizadas: 999,
      maxSeguros: 999,
      maxProductosDestacados: 3,
      maxMiembrosEquipo: 5,
      permiteHeroPersonalizado: true,
      permiteColoresMarca: true,
      permiteLogoPersonalizado: true,
      permitePromociones: true,
      muestraResenasGoogle: true,
      maxResenasMostradas: 999,
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
      especialidadesPersonalizadas: true,
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

export function getPlanConfig(planId: PlanType): PlanConfig {
  return PLANS_CONFIG[planId];
}

export function canEditField(planId: PlanType, field: keyof PlanConfig["puedeEditar"]): boolean {
  return PLANS_CONFIG[planId].puedeEditar[field];
}

export function getLimit(planId: PlanType, limit: keyof PlanLimits): number | boolean {
  return PLANS_CONFIG[planId].limites[limit];
}

export function validateContent(
  planId: PlanType,
  content: {
    descripcion?: string;
    fotos?: string[];
    videos?: string[];
    especialidades?: string[];
    especialidadesPersonalizadas?: string[];
    seguros?: string[];
  }
): { valid: boolean; errors: string[] } {
  const plan = PLANS_CONFIG[planId];
  const errors: string[] = [];

if (content.especialidadesPersonalizadas && content.especialidadesPersonalizadas.length > plan.limites.maxEspecialidadesPersonalizadas) {
  errors.push(`Maximo ${plan.limites.maxEspecialidadesPersonalizadas} especialidades personalizadas permitidas`);
}

  if (content.descripcion && content.descripcion.length > plan.limites.maxCaracteresDescripcion) {
    errors.push(`La descripcion excede el limite de ${plan.limites.maxCaracteresDescripcion} caracteres`);
  }

  if (content.fotos && content.fotos.length > plan.limites.maxFotos) {
    errors.push(`Maximo ${plan.limites.maxFotos} fotos permitidas`);
  }

  if (content.videos && content.videos.length > plan.limites.maxVideos) {
    errors.push(`Maximo ${plan.limites.maxVideos} videos permitidos`);
  }

  if (content.especialidades && content.especialidades.length > plan.limites.maxEspecialidades) {
    errors.push(`Maximo ${plan.limites.maxEspecialidades} especialidades permitidas`);
  }

  if (content.especialidadesPersonalizadas && content.especialidadesPersonalizadas.length > plan.limites.maxEspecialidadesPersonalizadas) {
    errors.push(`Maximo ${plan.limites.maxEspecialidadesPersonalizadas} especialidades personalizadas permitidas`);
  }

  if (content.seguros && content.seguros.length > plan.limites.maxSeguros) {
    errors.push(`Maximo ${plan.limites.maxSeguros} seguros permitidos`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export const PLAN_ORDER: PlanType[] = ["free", "premium", "premium_plus"];

export function comparePlans(plan1: PlanType, plan2: PlanType): number {
  const index1 = PLAN_ORDER.indexOf(plan1);
  const index2 = PLAN_ORDER.indexOf(plan2);
  return index1 - index2;
}

export function isPlanSuperior(plan1: PlanType, plan2: PlanType): boolean {
  return comparePlans(plan1, plan2) > 0;
}

// ─────────────────────────────────────────────────────────────────
// MENSAJES Y TEXTOS
// ────────────────────────────────────────────────────────────────

export const PLAN_MESSAGES = {
  upgrade: {
    title: "Mejora tu plan",
    description: "Desbloquea mas funciones y aumenta tu visibilidad",
    cta: "Ver planes",
  },
  limitReached: {
    fotos: (max: number) => `Has alcanzado el limite de ${max} fotos. Mejora tu plan para agregar mas.`,
    descripcion: (max: number) => `Has alcanzado el limite de ${max} caracteres. Mejora tu plan para escribir mas.`,
    especialidades: (max: number) => `Has alcanzado el limite de ${max} especialidades. Mejora tu plan para agregar mas.`,
    especialidadesPersonalizadas: (max: number) => `Has alcanzado el limite de ${max} especialidades personalizadas. Mejora a Premium+ para ilimitadas.`,
  },
  featureLocked: (feature: string, planRequired: string) => 
    `${feature} esta disponible en el plan ${planRequired}. Mejora tu plan para desbloquearla.`,
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
      asunto: "Tu plan vence en 15 dias",
      cuerpo: "Renueva tu plan para mantener todas las funciones de tu ficha.",
    },
    7: {
      asunto: "Tu plan vence en 7 dias",
      cuerpo: "Ultimos 7 dias. Tu ficha perdera fotos y resenas si no renuevas.",
    },
    1: {
      asunto: "Tu plan vence manana",
      cuerpo: "Manana tu ficha cambiara al plan Gratis. Renueva ahora para mantener tu visibilidad.",
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
  frecuencia: "diaria",
  horaEjecucion: "03:00",
  accionAlVencer: "downgrade_to_free",
  archivarContenido: true,
};

// ─────────────────────────────────────────────────────────────────
// MEJORAS FUTURAS IDENTIFICADAS
// ─────────────────────────────────────────────────────────────────

/**
 * MEJORAS PENDIENTES PARA IMPLEMENTAR:
 * 
 * 1. INTEGRACIÓN CON STRIPE:
 *    - Agregar stripePriceId y stripeProductId a cada plan
 *    - Configurar webhooks para:
 *      * invoice.payment_succeeded (confirmar pago)
 *      * invoice.payment_failed (notificar fallo)
 *      * customer.subscription.updated (cambios de plan)
 *      * customer.subscription.deleted (cancelaciones)
 * 
 * 2. SISTEMA DE EMAILS:
 *    - Configurar Resend/SendGrid para envio de notificaciones
 *    - Templates HTML para:
 *      * Confirmacion de pago exitoso
 *      * Recordatorio de renovacion (15, 7, 1 dias)
 *      * Aviso de pago fallido
 *      * Confirmacion de downgrade
 * 
 * 3. WHATSAPP BUSINESS API:
 *    - Integrar con Twilio o Meta Business API
 *    - Enviar recordatorios automaticos
 *    - Templates aprobados por Meta
 * 
 * 4. DASHBOARD DE FACTURACION:
 *    - Historial de pagos
 *    - Descarga de facturas (XML/PDF)
 *    - Actualizacion de metodo de pago
 *    - Cancelacion de suscripcion
 * 
 * 5. PRORRATEO:
 *    - Calcular prorrateo al hacer upgrade mid-cycle
 *    - Calcular credito al hacer downgrade
 * 
 * 6. PERIODO DE GRACIA:
 *    - 3-7 dias de gracia despues del vencimiento
 *    - Mantener ficha visible pero con badge "Pago pendiente"
 * 
 * 7. DESCUENTOS Y CUPONES:
 *    - Sistema de cupones de descuento
 *    - Descuento por pago anual (10-20%)
 *    - Descuento por referido
 * 
 * 8. MULTI-SUCURSALES:
 *    - Planes corporativos con N sucursales
 *    - Facturacion consolidada
 *    - Dashboard multi-ubicacion
 */