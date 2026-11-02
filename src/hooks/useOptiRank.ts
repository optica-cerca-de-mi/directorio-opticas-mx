"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { rankOpticas, RankingContext, OpticaConScore, MetricasRanking } from "@/lib/ranking-engine";
import { Optica } from "@/types/optica";
import { registrarEvento } from "@/lib/ranking-metrics";

interface UseOptiRankOptions {
  opticas: Optica[];
  contexto: RankingContext;
  topRecomendadas?: number;
  autoTrack?: boolean;
}

interface UseOptiRankReturn {
  opticasRanking: OpticaConScore[];
  metricas: MetricasRanking | null;
  trackImpresion: (opticaId: string, posicion: number, score: number) => void;
  trackClic: (opticaId: string, posicion: number, score: number) => void;
  trackWhatsApp: (opticaId: string) => void;
  perfilDetectado: string;
}

export function useOptiRank({
  opticas,
  contexto,
  topRecomendadas = 3,
  autoTrack = true,
}: UseOptiRankOptions): UseOptiRankReturn {
  const [metricas, setMetricas] = useState<MetricasRanking | null>(null);
  
  // Ref para evitar registrar impresiones duplicadas
  const impresionesRegistradas = useRef<Set<string>>(new Set());

  // Calcular ranking con useMemo - dependencias estables
  const { opticas: opticasRanking, metricas: nuevasMetricas } = useMemo(() => {
    return rankOpticas(opticas, contexto, topRecomendadas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opticas.length, contexto.sessionId, contexto.filtros?.especialidad, contexto.filtros?.seguro, contexto.filtros?.abiertaAhora, contexto.filtros?.textoBusqueda, contexto.ubicacionUsuario?.lat, contexto.ubicacionUsuario?.lng]);

  // Actualizar métricas solo si cambiaron realmente
  const metricasRef = useRef(metricas);
  useEffect(() => {
    if (nuevasMetricas && JSON.stringify(nuevasMetricas) !== JSON.stringify(metricasRef.current)) {
      metricasRef.current = nuevasMetricas;
      setMetricas(nuevasMetricas);
    }
  }, [nuevasMetricas]);

  // Track de impresiones - solo una vez por sesión
  useEffect(() => {
    if (autoTrack && opticasRanking.length > 0) {
      opticasRanking.forEach((optica, index) => {
        const key = `${optica.id}-${contexto.sessionId}`;
        if (!impresionesRegistradas.current.has(key)) {
          impresionesRegistradas.current.add(key);
          registrarEvento({
            tipo: "impresion",
            opticaId: optica.id,
            sessionId: contexto.sessionId || "anonimo",
            timestamp: new Date(),
            posicion: index,
            score: optica.score,
            perfil: optica.perfilDetectado,
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opticasRanking.length, contexto.sessionId]);

  // Funciones de tracking manual
  const trackImpresion = (opticaId: string, posicion: number, score: number) => {
    registrarEvento({
      tipo: "impresion",
      opticaId,
      sessionId: contexto.sessionId || "anonimo",
      timestamp: new Date(),
      posicion,
      score,
      perfil: opticasRanking.find((o) => o.id === opticaId)?.perfilDetectado || "desconocido",
    });
  };

  const trackClic = (opticaId: string, posicion: number, score: number) => {
    registrarEvento({
      tipo: "clic",
      opticaId,
      sessionId: contexto.sessionId || "anonimo",
      timestamp: new Date(),
      posicion,
      score,
      perfil: opticasRanking.find((o) => o.id === opticaId)?.perfilDetectado || "desconocido",
    });
  };

  const trackWhatsApp = (opticaId: string) => {
    registrarEvento({
      tipo: "whatsapp",
      opticaId,
      sessionId: contexto.sessionId || "anonimo",
      timestamp: new Date(),
      posicion: 0,
      score: 0,
      perfil: "desconocido",
    });
  };

  return {
    opticasRanking,
    metricas,
    trackImpresion,
    trackClic,
    trackWhatsApp,
    perfilDetectado: metricas?.perfilDetectado || "explorador",
  };
}