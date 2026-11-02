import { MetricasRanking, OpticaConScore } from "./ranking-engine";

/**
 * Sistema de métricas para el algoritmo de recomendación
 * Inspirado en recharts para visualización
 */

export interface EventoRecomendacion {
  tipo: "impresion" | "clic" | "whatsapp" | "llamada" | "vista_ficha";
  opticaId: string;
  sessionId: string;
  timestamp: Date;
  posicion: number;
  score: number;
  perfil: string;
}

// Almacenamiento en memoria (en producción usar Firebase Analytics)
const eventos: EventoRecomendacion[] = [];

/**
 * Registra un evento de interacción
 */
export function registrarEvento(evento: EventoRecomendacion): void {
  eventos.push(evento);
  
  // En producción: enviar a Firebase Analytics
  // analytics.logEvent('optica_interaccion', evento);
}

/**
 * Calcula tasa de conversión del algoritmo
 */
export function calcularTasaConversion(): {
  impresiones: number;
  clics: number;
  tasaConversion: number;
  topOpticas: string[];
} {
  const impresiones = eventos.filter((e) => e.tipo === "impresion").length;
  const clics = eventos.filter((e) => e.tipo === "clic").length;
  const tasaConversion = impresiones > 0 ? (clics / impresiones) * 100 : 0;

  // Top ópticas más clickeadas
  const clicsPorOptica: Record<string, number> = {};
  eventos
    .filter((e) => e.tipo === "clic")
    .forEach((e) => {
      clicsPorOptica[e.opticaId] = (clicsPorOptica[e.opticaId] || 0) + 1;
    });

  const topOpticas = Object.entries(clicsPorOptica)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  return { impresiones, clics, tasaConversion, topOpticas };
}

/**
 * Valida la calidad del algoritmo
 */
export function validarAlgoritmo(metricas: MetricasRanking): {
  valido: boolean;
  advertencias: string[];
} {
  const advertencias: string[] = [];

  if (metricas.tiempoCalculo > 100) {
    advertencias.push(`Cálculo lento: ${metricas.tiempoCalculo}ms`);
  }

  if (metricas.opticasFiltradas === 0) {
    advertencias.push("Sin resultados filtrados");
  }

  if (metricas.opticasRecomendadas.length === 0) {
    advertencias.push("Sin ópticas recomendadas");
  }

  return {
    valido: advertencias.length === 0,
    advertencias,
  };
}

/**
 * Exporta métricas para dashboard administrativo
 * Inspirado en recharts para visualización
 */
export function exportarMetricasParaDashboard() {
  const conversion = calcularTasaConversion();
  
  return {
    resumen: {
      totalEventos: eventos.length,
      tasaConversion: conversion.tasaConversion.toFixed(2) + "%",
      topOpticas: conversion.topOpticas,
    },
    eventosRecientes: eventos.slice(-10),
  };
}