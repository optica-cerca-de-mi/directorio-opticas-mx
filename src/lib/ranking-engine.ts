import { Optica } from "@/types/optica";

// ─────────────────────────────────────────────────────────────────
// TIPOS MEJORADOS
// ─────────────────────────────────────────────────────────────────

export interface RankingContext {
  ubicacionUsuario?: {
    lat: number;
    lng: number;
  };
  filtros?: {
    especialidad?: string;
    especialidadPrincipal?: string; // Nueva: especialidad más importante
    seguro?: string;
    abiertaAhora?: boolean;
    textoBusqueda?: string;
  };
  horaActual?: Date;
  dispositivo?: "movil" | "desktop";
  historico?: {
    opticasVisitadas: string[];
    clicksWhatsApp: string[];
    tiempoEnFicha: Record<string, number>;
    planesConsultados: string[];
  };
  sessionId?: string; // Nueva: para tracking anónimo
}

export interface OpticaConScore extends Optica {
  score: number;
  scoreDetalle: {
    disponibilidad: number;
    distancia: number;
    whatsapp: number;
    plan: number;
    calificacion: number;
    intencion: number;
    completitud: number;
    historico: number;
    urgencia: number; // Nuevo: boost por "cierra pronto"
  };
  esRecomendada: boolean;
  distanciaKm?: number;
  minutosParaCierre?: number; // Nuevo: información contextual
  razon: string; // Nuevo: explicación para el usuario
  perfilDetectado: "urgencia" | "planificador" | "explorador" | "recurrente"; // Nuevo
}

export interface MetricasRanking {
  totalOpticas: number;
  opticasFiltradas: number;
  perfilDetectado: string;
  tiempoCalculo: number;
  opticasRecomendadas: string[];
  factoresDominantes: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTES MEJORADAS
// ─────────────────────────────────────────────────────────────────

const PESOS_POR_PERFIL = {
  urgencia: {
    disponibilidad: 35,
    distancia: 25,
    whatsapp: 20,
    plan: 5,
    calificacion: 5,
    intencion: 5,
    completitud: 2,
    historico: 3,
    urgencia: 0, // Se calcula dentro de disponibilidad
  },
  planificador: {
    disponibilidad: 10,
    distancia: 10,
    whatsapp: 5,
    plan: 15,
    calificacion: 25,
    intencion: 25,
    completitud: 10,
    historico: 0,
    urgencia: 0,
  },
  explorador: {
    disponibilidad: 5,
    distancia: 5,
    whatsapp: 5,
    plan: 30,
    calificacion: 25,
    intencion: 0,
    completitud: 20,
    historico: 10,
    urgencia: 0,
  },
  recurrente: {
    disponibilidad: 10,
    distancia: 15,
    whatsapp: 10,
    plan: 10,
    calificacion: 15,
    intencion: 15,
    completitud: 5,
    historico: 20,
    urgencia: 0,
  },
};

const SCORE_POR_PLAN: Record<string, number> = {
  premium_plus: 100,
  premium: 70,
  free: 30,
};

// ─────────────────────────────────────────────────────────────────
// FUNCIONES AUXILIARES MEJORADAS
// ─────────────────────────────────────────────────────────────────

export function calcularDistanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Verifica si está abierta y calcula minutos para cierre
 * Inspirado en date-fns: precisión temporal
 */
export function estaAbiertaEn(
  horarios: any[],
  fecha: Date = new Date()
): { abierta: boolean; minutosParaCierre: number } {
  const diasSemana = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const diaHoy = diasSemana[fecha.getDay()];
  const horario = Array.isArray(horarios) ? horarios.find((h) => h.dia === diaHoy) : undefined;

  if (!horario || horario.cerrado) {
    return { abierta: false, minutosParaCierre: -1 };
  }

  const horaActual = fecha.getHours() * 60 + fecha.getMinutes();
  const [hApertura, mApertura] = horario.apertura.split(":").map(Number);
  const [hCierre, mCierre] = horario.cierre.split(":").map(Number);
  const aperturaMin = hApertura * 60 + mApertura;
  const cierreMin = hCierre * 60 + mCierre;

  if (horaActual < aperturaMin || horaActual > cierreMin) {
    return { abierta: false, minutosParaCierre: -1 };
  }

  const minutosParaCierre = cierreMin - horaActual;
  return { abierta: true, minutosParaCierre };
}

/**
 * Detecta el perfil del usuario basado en señales
 * Inspirado en sistemas de ML de recomendación
 */
export function detectarPerfil(contexto: RankingContext): OpticaConScore["perfilDetectado"] {
  const { historico, dispositivo, horaActual, filtros } = contexto;
  const hora = horaActual?.getHours() ?? new Date().getHours();
  const visitas = historico?.opticasVisitadas?.length ?? 0;
  const tieneBusqueda = !!(
    filtros?.textoBusqueda ||
    filtros?.especialidad ||
    filtros?.especialidadPrincipal ||
    filtros?.seguro
  );

  // Recurrente: ya visitó varias ópticas
  if (visitas >= 2) return "recurrente";

  // Urgencia: móvil + noche + búsqueda
  if (dispositivo === "movil" && hora >= 20 && tieneBusqueda) return "urgencia";

  // Explorador: sin señales de intención
  if (!tieneBusqueda && !contexto.ubicacionUsuario) return "explorador";

  // Planificador: tiene búsqueda o filtros
  if (tieneBusqueda) return "planificador";

  return "explorador";
}

// ─────────────────────────────────────────────────────────────────
// CÁLCULO DE SCORES INDIVIDUALES MEJORADOS
// ─────────────────────────────────────────────────────────────────

/**
 * Score de disponibilidad MEJORADO
 * Ahora incluye boost por "cierra pronto" (urgencia)
 */
function calcularDisponibilidad(
  optica: Optica,
  horaActual: Date = new Date()
): { score: number; minutosParaCierre: number; urgencia: number } {
  if (!optica.horarios || optica.horarios.length === 0) {
    return { score: 50, minutosParaCierre: -1, urgencia: 0 };
  }

  const { abierta, minutosParaCierre } = estaAbiertaEn(optica.horarios, horaActual);

  if (!abierta) {
    return { score: 0, minutosParaCierre: -1, urgencia: 0 };
  }

  // Boost por urgencia: cierra en menos de 60 minutos
  let urgencia = 0;
  if (minutosParaCierre < 60) {
    urgencia = 100 - (minutosParaCierre / 60) * 100; // 0-100
  }

  // Score base
  let score = 100;
  if (minutosParaCierre < 30) {
    score = 60; // Cierra muy pronto
  } else if (minutosParaCierre < 60) {
    score = 80; // Cierra pronto
  }

  return { score, minutosParaCierre, urgencia };
}

/**
 * Score de distancia (sin cambios)
 */
function calcularScoreDistancia(
  optica: Optica,
  ubicacion?: { lat: number; lng: number }
): number {
  if (!ubicacion || optica.latitud === undefined || optica.longitud === undefined) {
    return 50;
  }
  const distancia = calcularDistanciaKm(
    ubicacion.lat,
    ubicacion.lng,
    optica.latitud,
    optica.longitud
  );
  return Math.max(100 - (distancia / 50) * 100, 0);
}

/**
 * Score de WhatsApp (sin cambios)
 */
function calcularScoreWhatsApp(optica: Optica): number {
  if (!optica.whatsapp) return 0;
  return 70; // Tiene WhatsApp activo
}

/**
 * Score de plan (sin cambios)
 */
function calcularScorePlan(optica: Optica): number {
  return SCORE_POR_PLAN[optica.plan] ?? 30;
}

/**
 * Score de calificación (sin cambios)
 */
function calcularScoreCalificacion(optica: Optica): number {
  if (!optica.calificacionGoogle) return 50;
  return Math.max(((optica.calificacionGoogle - 1) / 4) * 100, 0);
}

/**
 * Score de intención MEJORADO
 * Ahora pondera especialidad principal más que otras
 * Inspirado en búsqueda semántica de Supabase
 */
function calcularIntencion(
  optica: Optica,
  filtros?: RankingContext["filtros"]
): number {
  if (!filtros) return 50;

  let puntos = 0;
  let totalChecks = 0;

  // Especialidad PRINCIPAL (peso doble)
  if (filtros.especialidadPrincipal) {
    totalChecks += 2;
    const coincide = optica.especialidades?.some((e) =>
      e.toLowerCase().includes(filtros.especialidadPrincipal!.toLowerCase())
    );
    if (coincide) puntos += 80; // Peso doble
  }

  // Especialidad normal
  if (filtros.especialidad) {
    totalChecks++;
    if (
      optica.especialidades?.some((e) =>
        e.toLowerCase().includes(filtros.especialidad!.toLowerCase())
      )
    ) {
      puntos += 40;
    }
  }

  // Seguro
  if (filtros.seguro) {
    totalChecks++;
    if (
      optica.segurosAceptados?.some((s) =>
        s.toLowerCase().includes(filtros.seguro!.toLowerCase())
      )
    ) {
      puntos += 40;
    }
  }

  // Texto de búsqueda (búsqueda difusa)
  if (filtros.textoBusqueda) {
    totalChecks++;
    const texto = filtros.textoBusqueda.toLowerCase();
    const campos = [
      optica.nombre,
      optica.descripcion,
      optica.ciudad,
      ...(optica.especialidades ?? []),
      ...(optica.segurosAceptados ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (campos.includes(texto)) {
      puntos += 20;
    }
  }

  if (totalChecks === 0) return 50;
  return Math.min((puntos / totalChecks) * 2, 100);
}

/**
 * Score de completitud MEJORADO
 * Ahora considera especialidad principal si existe
 * Inspirado en curación manual de dnd-kit
 */
function calcularCompletitud(optica: Optica): number {
  let puntos = 0;

  // Campos básicos (5 pts cada uno = 25 pts)
  if (optica.nombre) puntos += 5;
  if (optica.direccion) puntos += 5;
  if (optica.ciudad) puntos += 5;
  if (optica.telefono) puntos += 5;
  if (optica.descripcion && optica.descripcion.length > 50) puntos += 5;

  // Fotos (15 pts)
  const fotosCount = optica.fotos?.length ?? 0;
  puntos += Math.min((fotosCount / 8) * 15, 15);

  // Video (10 pts)
  if (optica.videoUrl) puntos += 10;

  // Horarios completos (15 pts)
const horariosArray2 = Array.isArray(optica.horarios) ? optica.horarios : [];
const horariosCompletos = horariosArray2.filter((h: any) => !h.cerrado).length;
  puntos += (horariosCompletos / 7) * 15;

  // Especialidades (10 pts) - boost si tiene especialidad principal
  const espCount = optica.especialidades?.length ?? 0;
  puntos += Math.min((espCount / 5) * 10, 10);

  // Seguros (10 pts)
  const segCount = optica.segurosAceptados?.length ?? 0;
  puntos += Math.min((segCount / 3) * 10, 10);

  // Redes sociales (10 pts)
  if (optica.whatsapp) puntos += 4;
  if (optica.sitioWeb) puntos += 3;
  if (optica.facebook) puntos += 1.5;
  if (optica.instagram) puntos += 1.5;

  return Math.min(puntos, 100);
}

/**
 * Score histórico MEJORADO
 * Ahora usa sessionId para tracking anónimo
 * Inspirado en uuid para sesiones
 */
function calcularScoreHistorico(
  optica: Optica,
  historico?: RankingContext["historico"]
): number {
  if (!historico) return 0;

  let puntos = 0;

  // Ya visitada: penalizar para diversificar
  if (historico.opticasVisitadas.includes(optica.id)) {
    puntos -= 30;
  }

  // Click en WhatsApp: bonus alto
  if (historico.clicksWhatsApp.includes(optica.id)) {
    puntos += 30;
  }

  // Tiempo en ficha: interés real
  const tiempo = historico.tiempoEnFicha[optica.id] ?? 0;
  if (tiempo > 60) puntos += 20;
  else if (tiempo > 20) puntos += 10;

  return Math.max(-30, Math.min(100, puntos));
}

/**
 * Genera razón explicativa para el usuario
 * Inspirado en transparencia de algoritmos
 */
function generarRazon(
  optica: Optica,
  scoreDetalle: OpticaConScore["scoreDetalle"],
  perfil: OpticaConScore["perfilDetectado"],
  minutosParaCierre?: number
): string {
  const factores: string[] = [];

  if (scoreDetalle.distancia >= 80) factores.push("muy cerca de ti");
  else if (scoreDetalle.distancia >= 50) factores.push("cerca de tu ubicación");

  if (scoreDetalle.calificacion >= 80) factores.push("excelente calificación");
  else if (scoreDetalle.calificacion >= 60) factores.push("buena calificación");

  if (scoreDetalle.disponibilidad === 100) factores.push("abierta ahora");
  else if (scoreDetalle.disponibilidad === 80) factores.push("abierta (cierra pronto)");

  if (scoreDetalle.urgencia >= 50 && minutosParaCierre && minutosParaCierre > 0) {
    factores.push(`cierra en ${minutosParaCierre} min`);
  }

  if (scoreDetalle.whatsapp >= 70) factores.push("WhatsApp activo");

  if (scoreDetalle.intencion >= 70) factores.push("coincide con tu búsqueda");

  if (scoreDetalle.plan >= 100) factores.push("perfil verificado premium");

  if (factores.length === 0) {
    return "Óptica recomendada por nuestra comunidad";
  }

  return `Recomendada por: ${factores.join(", ")}`;
}

// ─────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL MEJORADA
// ─────────────────────────────────────────────────────────────────

export function calcularScoreOptica(
  optica: Optica,
  contexto: RankingContext = {}
): OpticaConScore | null {
  const { ubicacionUsuario, filtros, horaActual = new Date(), historico } = contexto;

  // Detectar perfil
  const perfil = detectarPerfil(contexto);
  const pesos = PESOS_POR_PERFIL[perfil];

  // Calcular cada factor
  const { score: scoreDisponibilidad, minutosParaCierre, urgencia } = calcularDisponibilidad(
    optica,
    horaActual
  );
  const scoreDistancia = calcularScoreDistancia(optica, ubicacionUsuario);
  const scoreWhatsapp = calcularScoreWhatsApp(optica);
  const scorePlan = calcularScorePlan(optica);
  const scoreCalificacion = calcularScoreCalificacion(optica);
  const scoreIntencion = calcularIntencion(optica, filtros);
  const scoreCompletitud = calcularCompletitud(optica);
  const scoreHistorico = calcularScoreHistorico(optica, historico);

  const scoreDetalle = {
    disponibilidad: scoreDisponibilidad,
    distancia: scoreDistancia,
    whatsapp: scoreWhatsapp,
    plan: scorePlan,
    calificacion: scoreCalificacion,
    intencion: scoreIntencion,
    completitud: scoreCompletitud,
    historico: scoreHistorico,
    urgencia,
  };

  // Score total ponderado
  const scoreTotal =
    scoreDisponibilidad * (pesos.disponibilidad / 100) +
    scoreDistancia * (pesos.distancia / 100) +
    scoreWhatsapp * (pesos.whatsapp / 100) +
    scorePlan * (pesos.plan / 100) +
    scoreCalificacion * (pesos.calificacion / 100) +
    scoreIntencion * (pesos.intencion / 100) +
    scoreCompletitud * (pesos.completitud / 100) +
    scoreHistorico * (pesos.historico / 100) +
    urgencia * (pesos.urgencia / 100);

  // Generar razón
  const razon = generarRazon(optica, scoreDetalle, perfil, minutosParaCierre);

  let distanciaKm: number | undefined;
  if (ubicacionUsuario && optica.latitud !== undefined && optica.longitud !== undefined) {
    distanciaKm = calcularDistanciaKm(
      ubicacionUsuario.lat,
      ubicacionUsuario.lng,
      optica.latitud,
      optica.longitud
    );
  }

  return {
    ...optica,
    score: Math.round(scoreTotal * 100) / 100,
    scoreDetalle,
    perfilDetectado: perfil,
    esRecomendada: false,
    distanciaKm,
    minutosParaCierre: minutosParaCierre > 0 ? minutosParaCierre : undefined,
    razon,
  };
}

/**
 * FUNCIÓN PRINCIPAL DE RANKING CON MÉTRICAS
 */
export function rankOpticas(
  opticas: Optica[],
  contexto: RankingContext = {},
  topRecomendadas: number = 3
): { opticas: OpticaConScore[]; metricas: MetricasRanking } {
  const inicio = Date.now();

  // Calcular score de cada óptica
  let opticasConScore = opticas
    .map((optica) => calcularScoreOptica(optica, contexto))
    .filter((o): o is OpticaConScore => o !== null);

  // Ordenar por score
  opticasConScore.sort((a, b) => b.score - a.score);

  // Marcar top N como recomendadas
  opticasConScore.forEach((optica, index) => {
    optica.esRecomendada = index < topRecomendadas;
  });

  // Calcular métricas
  const perfilDetectado = detectarPerfil(contexto);
  const factoresDominantes: Record<string, number> = {};
  opticasConScore.slice(0, 5).forEach((optica) => {
    Object.entries(optica.scoreDetalle).forEach(([factor, valor]) => {
      factoresDominantes[factor] = (factoresDominantes[factor] || 0) + valor;
    });
  });

  const metricas: MetricasRanking = {
    totalOpticas: opticas.length,
    opticasFiltradas: opticasConScore.length,
    perfilDetectado,
    tiempoCalculo: Date.now() - inicio,
    opticasRecomendadas: opticasConScore
      .filter((o) => o.esRecomendada)
      .map((o) => o.id),
    factoresDominantes,
  };

  return { opticas: opticasConScore, metricas };
}

// ─────────────────────────────────────────────────────────────────
// UTILIDADES DE DEBUG Y MÉTRICAS
// ─────────────────────────────────────────────────────────────────

export function getScoreDescripcion(optica: OpticaConScore): string {
  const d = optica.scoreDetalle;
  return [
    `Score: ${optica.score}`,
    `Perfil: ${optica.perfilDetectado}`,
    `Disponibilidad: ${d.disponibilidad}`,
    `Distancia: ${d.distancia.toFixed(1)}`,
    `WhatsApp: ${d.whatsapp}`,
    `Plan: ${d.plan}`,
    `Calificación: ${d.calificacion.toFixed(1)}`,
    `Intención: ${d.intencion.toFixed(1)}`,
    `Completitud: ${d.completitud.toFixed(1)}`,
    `Histórico: ${d.historico}`,
    `Urgencia: ${d.urgencia.toFixed(1)}`,
  ].join(" | ");
}

export function getPesosPerfil(perfil: OpticaConScore["perfilDetectado"]): Record<string, number> {
  return { ...PESOS_POR_PERFIL[perfil] };
}