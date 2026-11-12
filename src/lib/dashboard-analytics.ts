/**
 * CAPA DE DATOS ANALÍTICOS DEL DASHBOARD
 * 
 * Esta capa abstrae el acceso a datos analíticos.
 * Actualmente usa datos simulados (MOCK).
 * 
 * Cuando se integre Analytics real (Firestore + cron jobs),
 * SOLO se reemplazan las implementaciones internas de estas funciones.
 * La interfaz pública NO cambia, por lo que el UI no requiere modificaciones.
 * 
 * PENDIENTE: Conectar con colección `analytics` en Firestore.
 */

export interface KPIData {
  relevanciaScore: number;
  relevanciaVariacion: number; // % vs semana anterior
  visitas30d: number;
  visitasVariacion: number;
  clicsWhatsApp30d: number;
  clicsVariacion: number;
  posicionPromedio: number; // 1 = mejor
  posicionVariacion: number;
}

export interface PuntoEvolucion {
  fecha: string; // "14 oct", "21 oct", etc.
  visitas: number;
  whatsapp: number;
}

export interface OrigenVisitas {
  origen: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

export interface UsoPlan {
  recurso: string;
  usado: number;
  maximo: number;
  etiqueta: string;
}

export interface EstadoFicha {
  excelente: number; // %
  bueno: number; // %
  porMejorar: number; // %
}

// ─────────────────────────────────────────────────────────────────
// FUNCIONES DE ACCESO A DATOS (MOCK)
// ─────────────────────────────────────────────────────────────────

/**
 * Obtiene los KPIs principales del dashboard.
 * MOCK: Reemplazar por query a Firestore `analytics/{opticaId}/kpis`
 */
export async function getKPIData(opticaId: string): Promise<KPIData> {
  // Simulamos un pequeño delay de red
  await new Promise((r) => setTimeout(r, 100));

  // Datos mock basados en el opticaId para que sea consistente
  const seed = opticaId.length;
  
  return {
    relevanciaScore: 78,
    relevanciaVariacion: +12,
    visitas30d: 127 + (seed % 50),
    visitasVariacion: +23,
    clicsWhatsApp30d: 34 + (seed % 15),
    clicsVariacion: +8,
    posicionPromedio: 3,
    posicionVariacion: -2, // negativo = mejoró
  };
}

/**
 * Obtiene la evolución de visitas de los últimos N días.
 * MOCK: Reemplazar por agregación en Firestore.
 */
export async function getEvolucionVisitas(
  opticaId: string,
  dias: number = 30
): Promise<PuntoEvolucion[]> {
  await new Promise((r) => setTimeout(r, 50));

  // Generamos 8 puntos (una vez por semana aprox)
  const puntos: PuntoEvolucion[] = [];
  const hoy = new Date();
  
  for (let i = 7; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - (i * Math.floor(dias / 7)));
    
    const baseVisitas = 8 + Math.floor(Math.random() * 12);
    const baseWA = Math.floor(baseVisitas * 0.3);
    
    puntos.push({
      fecha: fecha.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
      visitas: baseVisitas,
      whatsapp: baseWA,
    });
  }

  return puntos;
}

/**
 * Obtiene el origen de las visitas.
 * MOCK: Reemplazar por tracking de referrer + eventos de Franklin.
 */
export async function getOrigenVisitas(
  opticaId: string
): Promise<OrigenVisitas[]> {
  await new Promise((r) => setTimeout(r, 50));

  return [
    { origen: "Franklin (Búsqueda IA)", cantidad: 64, porcentaje: 50, color: "#0f172a" },
    { origen: "Directorio", cantidad: 38, porcentaje: 30, color: "#d4af37" },
    { origen: "Google", cantidad: 19, porcentaje: 15, color: "#3483fa" },
    { origen: "Directo", cantidad: 6, porcentaje: 5, color: "#94a3b8" },
  ];
}

/**
 * Obtiene el uso de recursos del plan.
 * MOCK: Reemplazar por lectura directa del documento de la óptica.
 */
export async function getUsoPlan(
  opticaId: string,
  plan: string = "premium_plus"
): Promise<UsoPlan[]> {
  await new Promise((r) => setTimeout(r, 50));

  const limites = {
    free: { fotos: 3, bloques: 0, especialidades: 3, productos: 0 },
    premium: { fotos: 8, bloques: 0, especialidades: 8, productos: 1 },
    premium_plus: { fotos: 15, bloques: 10, especialidades: 999, productos: 3 },
  };

  const max = limites[plan as keyof typeof limites] || limites.premium_plus;

  return [
    {
      recurso: "fotos",
      usado: Math.min(6, max.fotos),
      maximo: max.fotos,
      etiqueta: "Fotos de galería",
    },
    {
      recurso: "bloques",
      usado: Math.min(3, max.bloques),
      maximo: max.bloques,
      etiqueta: "Bloques de contenido enriquecido",
    },
    {
      recurso: "especialidades",
      usado: Math.min(5, max.especialidades),
      maximo: max.especialidades,
      etiqueta: "Especialidades personalizadas",
    },
    {
      recurso: "productos",
      usado: Math.min(1, max.productos),
      maximo: max.productos,
      etiqueta: "Productos destacados",
    },
  ];
}

/**
 * Calcula el estado general de la ficha (para la dona).
 * MOCK: Reemplazar por cálculo basado en OptiRelevance.
 */
export async function getEstadoFicha(
  opticaId: string
): Promise<EstadoFicha> {
  await new Promise((r) => setTimeout(r, 50));

  return {
    excelente: 66,
    bueno: 22,
    porMejorar: 12,
  };
}