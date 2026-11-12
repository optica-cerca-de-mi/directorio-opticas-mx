/**
 * UTILIDADES DE BÚSQUEDA COMPARTIDAS
 *
 * Este archivo contiene funciones reutilizables para búsqueda y filtrado
 * que usan tanto Franklin (Home) como el Directorio (/opticas).
 *
 * Versión 2.0: Integración con OptiRelevance Engine
 */

import { calcularOptiRelevance, OptiRelevanceInput } from "./franklin-rank";

// ─────────────────────────────────────────────────────────────────
// NORMALIZACIÓN DE TEXTO
// ─────────────────────────────────────────────────────────────────

/**
 * Normaliza texto eliminando acentos y convirtiendo a minúsculas
 * Ejemplo: "diabétes" → "diabetes", "Óptica" → "optica"
 */
export const normalizarTexto = (texto: string): string => {
  if (!texto) return "";
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

// ─────────────────────────────────────────────────────────────────
// FILTRADO BÁSICO (Versión 1.0 - se mantiene para compatibilidad)
// ─────────────────────────────────────────────────────────────────

/**
 * Filtra ópticas por búsqueda de texto libre en múltiples campos
 */
export const buscarPorTexto = (
  opticas: any[],
  busqueda: string
): any[] => {
  const busquedaNormalizada = normalizarTexto(busqueda);

  if (!busquedaNormalizada) return opticas;

  return opticas.filter((optica) => {
    return (
      normalizarTexto(optica.nombre || "").includes(busquedaNormalizada) ||
      normalizarTexto(optica.ciudad || "").includes(busquedaNormalizada) ||
      normalizarTexto(optica.direccion || "").includes(busquedaNormalizada) ||
      normalizarTexto(optica.descripcion || "").includes(busquedaNormalizada) ||
      (optica.especialidades || []).some((e: string) =>
        normalizarTexto(e).includes(busquedaNormalizada)
      ) ||
      (optica.especialidadesPersonalizadas || []).some((e: string) =>
        normalizarTexto(e).includes(busquedaNormalizada)
      ) ||
      (optica.segurosAceptados || []).some((s: string) =>
        normalizarTexto(s).includes(busquedaNormalizada)
      )
    );
  });
};

/**
 * Filtra ópticas por especialidad (genéricas y personalizadas)
 */
export const filtrarPorEspecialidad = (
  opticas: any[],
  especialidad: string
): any[] => {
  if (!especialidad) return opticas;

  const especialidadNormalizada = normalizarTexto(especialidad);

  return opticas.filter((optica) => {
    return (
      (optica.especialidades || []).some((e: string) =>
        normalizarTexto(e).includes(especialidadNormalizada)
      ) ||
      (optica.especialidadesPersonalizadas || []).some((e: string) =>
        normalizarTexto(e).includes(especialidadNormalizada)
      )
    );
  });
};

/**
 * Filtra ópticas por ciudad
 */
export const filtrarPorCiudad = (
  opticas: any[],
  ciudad: string
): any[] => {
  if (!ciudad) return opticas;

  const ciudadNormalizada = normalizarTexto(ciudad);

  return opticas.filter((optica) => {
    return (
      normalizarTexto(optica.ciudad || "").includes(ciudadNormalizada) ||
      normalizarTexto(optica.estado || "").includes(ciudadNormalizada)
    );
  });
};

/**
 * Filtra ópticas por seguro
 */
export const filtrarPorSeguro = (
  opticas: any[],
  seguro: string
): any[] => {
  if (!seguro) return opticas;

  const seguroNormalizado = normalizarTexto(seguro);

  return opticas.filter((optica) => {
    return (optica.segurosAceptados || []).some((s: string) =>
      normalizarTexto(s).includes(seguroNormalizado)
    );
  });
};

// ─────────────────────────────────────────────────────────────────
// SCORING CLÁSICO (Versión 1.0 - se mantiene para compatibilidad)
// ─────────────────────────────────────────────────────────────────

/**
 * Sistema de scoring clásico para ordenar resultados
 * (Versión anterior, mantenida por compatibilidad con Franklin)
 */
export const aplicarScoring = (
  opticas: any[],
  especialidad?: string,
  ciudad?: string
): any[] => {
  if (!especialidad && !ciudad) return opticas;

  const especialidadNormalizada = especialidad ? normalizarTexto(especialidad) : null;

  return opticas.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.plan === "premium_plus") scoreA += 30;
    else if (a.plan === "premium") scoreA += 20;
    if (b.plan === "premium_plus") scoreB += 30;
    else if (b.plan === "premium") scoreB += 20;

    if (especialidadNormalizada) {
      const aTienePersonalizada = (a.especialidadesPersonalizadas || []).some((e: string) =>
        normalizarTexto(e).includes(especialidadNormalizada)
      );
      const bTienePersonalizada = (b.especialidadesPersonalizadas || []).some((e: string) =>
        normalizarTexto(e).includes(especialidadNormalizada)
      );

      if (aTienePersonalizada) scoreA += 50;
      if (bTienePersonalizada) scoreB += 50;

      const aTieneGenerica = (a.especialidades || []).some((e: string) =>
        normalizarTexto(e).includes(especialidadNormalizada)
      );
      const bTieneGenerica = (b.especialidades || []).some((e: string) =>
        normalizarTexto(e).includes(especialidadNormalizada)
      );

      if (aTieneGenerica && !aTienePersonalizada) scoreA += 20;
      if (bTieneGenerica && !bTienePersonalizada) scoreB += 20;
    }

    scoreA += (a.calificacionGoogle || 0) * 2;
    scoreB += (b.calificacionGoogle || 0) * 2;

    return scoreB - scoreA;
  });
};

// ─────────────────────────────────────────────────────────────────
// OPTI RELEVANCE ENGINE (Versión 2.0 - NUEVO)
// ─────────────────────────────────────────────────────────────────

/**
 * Convierte una óptica del formato de Firestore al formato de OptiRelevanceInput
 */
const toRelevanceInput = (optica: any): OptiRelevanceInput => ({
  id: optica.id,
  plan: optica.plan,
  calificacionGoogle: optica.calificacionGoogle,
  numResenas: optica.numResenas,
  fechaCreacion: optica.fechaCreacion,
  descripcion: optica.descripcion,
  especialidades: optica.especialidades,
  especialidadesPersonalizadas: optica.especialidadesPersonalizadas,
  segurosAceptados: optica.segurosAceptados,
  fotos: optica.fotos,
  logo: optica.logo,
  horarios: optica.horarios,
  bloquesContenido: optica.bloquesContenido,
  productosDestacados: optica.productosDestacados,
  promociones: optica.promociones,
  ciudad: optica.ciudad,
  estado: optica.estado,
});

/**
 * Ordena ópticas usando el OptiRelevance Engine completo.
 * 
 * Esta es la versión 2.0 del scoring:
 * - Calcula Relevancia × Quality Score × Performance × Plan Multiplier
 * - Es más preciso que aplicarScoring() porque evalúa la completitud de la ficha
 * - Ideal para cuando NO hay un término de búsqueda específico (ranking general)
 */
export const ordenarPorOptiRelevance = (
  opticas: any[],
  terminoBusqueda?: string
): any[] => {
  return opticas
    .map((optica) => {
      const input = toRelevanceInput(optica);
      const resultado = calcularOptiRelevance(input, terminoBusqueda);
      return { optica, score: resultado.scoreTotal, resultado };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => ({
      ...item.optica,
      optiRelevanceScore: item.score,
      optiRelevanceDetails: item.resultado,
    }));
};

/**
 * FUNCIÓN MAESTRA: Busca + Filtra + Ordena con OptiRelevance en un solo paso.
 * 
 * Reemplaza la necesidad de llamar múltiples funciones manualmente.
 * Ideal para Franklin y para el Directorio cuando se quiere el ranking más preciso.
 * 
 * @param opticas - Lista completa de ópticas
 * @param filtros - Objeto con los filtros a aplicar
 * @param usarOptiRelevance - Si true, usa el motor completo; si false, usa el scoring clásico
 */
export const buscarConRanking = (
  opticas: any[],
  filtros: {
    texto?: string;
    especialidad?: string;
    ciudad?: string;
    seguro?: string;
  },
  usarOptiRelevance: boolean = true
): any[] => {
  let resultados = [...opticas];

  // 1. Aplicar filtros (en orden de especificidad)
  if (filtros.ciudad) {
    resultados = filtrarPorCiudad(resultados, filtros.ciudad);
  }

  if (filtros.especialidad) {
    resultados = filtrarPorEspecialidad(resultados, filtros.especialidad);
  }

  if (filtros.seguro) {
    resultados = filtrarPorSeguro(resultados, filtros.seguro);
  }

  if (filtros.texto) {
    resultados = buscarPorTexto(resultados, filtros.texto);
  }

  // 2. Ordenar resultados
  if (usarOptiRelevance) {
    resultados = ordenarPorOptiRelevance(resultados, filtros.texto);
  } else {
    resultados = aplicarScoring(resultados, filtros.especialidad, filtros.ciudad);
  }

  return resultados;
};

/**
 * Calcula el OptiRelevance Score de una sola óptica (para mostrar en el Dashboard).
 * Devuelve el score completo con sugerencias.
 */
export const obtenerScoreDeOptica = (optica: any) => {
  const input = toRelevanceInput(optica);
  return calcularOptiRelevance(input);
};