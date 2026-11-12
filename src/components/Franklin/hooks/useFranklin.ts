"use client";

import { useState, useRef, useCallback } from "react";
import {
  filtrarPorEspecialidad,
  filtrarPorCiudad,
  filtrarPorSeguro,
  aplicarScoring,
} from "@/lib/search-utils";

export interface OpticaTop {
  id: string;
  nombre: string;
  nombreComercial?: string;
  ciudad?: string;
  estado?: string;
  plan?: string;
  calificacionGoogle?: number;
  numResenas?: number;
  especialidades?: string[];
  especialidadesPersonalizadas?: string[];
  segurosAceptados?: string[];
  fotos?: Array<{ url: string }>;
  logo?: string;
  slug?: string;
  descripcion?: string;
  horarios?: Array<{ dia: string; apertura: string; cierre: string; cerrado: boolean }>;
  verificada?: boolean;
  whatsapp?: string;
  telefono?: string;
  urlGoogleMaps?: string;
}

export interface FranklinMessage {
  id: number;
  text: string;
  type: "thinking" | "success";
}

export interface FranklinFilters {
  ciudad?: string | null;
  especialidad?: string | null;
  seguro?: string | null;
}

export interface FranklinResponse {
  filtros: FranklinFilters;
  pasos_pensamiento: string[];
  mensaje_final: string;
  terminos_expandidos?: string[];
  terminos_clinicos?: string[];
}

export interface UseFranklinReturn {
  query: string;
  setQuery: (q: string) => void;
  state: "idle" | "thinking" | "done";
  messages: FranklinMessage[];
  results: OpticaTop[];
  summary: string;
  processQuery: () => Promise<void>;
  reset: () => void;
  resultsRef: React.RefObject<HTMLDivElement | null>;
}

interface UseFranklinProps {
  opticas: OpticaTop[];
  opticasRanking: OpticaTop[];
}

export function useFranklin({ opticas, opticasRanking }: UseFranklinProps): UseFranklinReturn {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"idle" | "thinking" | "done">("idle");
  const [messages, setMessages] = useState<FranklinMessage[]>([]);
  const [results, setResults] = useState<OpticaTop[]>([]);
  const [summary, setSummary] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const addStreamingMessage = useCallback(async (text: string) => {
    const msgId = Date.now() + Math.random();
    setMessages((prev) => [...prev, { id: msgId, text, type: "thinking" }]);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, type: "success" } : m))
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
  }, []);

  const processQuery = useCallback(async () => {
    if (!query.trim() || state === "thinking") return;

    setState("thinking");
    setMessages([]);
    setResults([]);
    setSummary("");

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const response = await fetch("/api/franklin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error en la busqueda");
      }

      const aiData: FranklinResponse = result.data;
      const { ciudad, especialidad, seguro } = aiData.filtros;

      // Mostrar pasos de pensamiento de la IA
      for (const paso of aiData.pasos_pensamiento) {
        await addStreamingMessage(paso);
      }

      // Filtrado con respaldo jerárquico
      let resultadosFiltrados = [...opticas];
      let hayCoincidenciasExactas = true;
      let hayCoincidenciaEspecialidad = false;

      // 1. Filtrar por ciudad
      if (ciudad) {
        const antes = resultadosFiltrados.length;
        resultadosFiltrados = filtrarPorCiudad(resultadosFiltrados, ciudad);
        if (resultadosFiltrados.length === 0 && antes > 0) {
          hayCoincidenciasExactas = false;
          await addStreamingMessage(`No encontramos opticas en ${ciudad}.`);
        }
      }

      // 2. Filtrar por especialidad (con respaldo jerárquico)
      if (especialidad) {
        const antes = resultadosFiltrados.length;
        resultadosFiltrados = filtrarPorEspecialidad(resultadosFiltrados, especialidad);

        if (resultadosFiltrados.length > 0) {
          hayCoincidenciaEspecialidad = true;
        } else if (antes > 0) {
          // RESPALDO: intentar con términos expandidos del diccionario
          const terminosRespaldo = aiData.terminos_expandidos || [];
          let encontrado = false;

          for (const termino of terminosRespaldo) {
            if (termino === especialidad) continue;
            const intento = filtrarPorEspecialidad([...opticas], termino);
            if (intento.length > 0) {
              resultadosFiltrados = intento;
              hayCoincidenciaEspecialidad = true;
              encontrado = true;
              await addStreamingMessage(
                `Ajustando busqueda: buscando "${termino}" en lugar de "${especialidad}".`
              );
              break;
            }
          }

          if (!encontrado) {
            hayCoincidenciasExactas = false;
            await addStreamingMessage(`No encontramos opticas con "${especialidad}".`);
          }
        }
      }

      // 3. Filtrar por seguro
      if (seguro) {
        const antes = resultadosFiltrados.length;
        resultadosFiltrados = filtrarPorSeguro(resultadosFiltrados, seguro);
        if (resultadosFiltrados.length === 0 && antes > 0) {
          hayCoincidenciasExactas = false;
          await addStreamingMessage(`No encontramos opticas que acepten ${seguro}.`);
        }
      }

      // 4. Scoring
      resultadosFiltrados = aplicarScoring(resultadosFiltrados, especialidad || undefined, ciudad || undefined);

      // 5. Lógica estricta: si hay coincidencias, mostrar SOLO esas
      if (resultadosFiltrados.length === 0) {
        await addStreamingMessage(
          "No encontramos opticas que coincidan con tu busqueda. Te mostramos las mejores opciones disponibles."
        );
        resultadosFiltrados = opticasRanking.slice(0, 3);
      } else {
        resultadosFiltrados = resultadosFiltrados.slice(0, 6);
      }

      // Mensaje final inteligente
      let resumenFinal = aiData.mensaje_final;
      if (!hayCoincidenciasExactas) {
        resumenFinal = `No encontramos coincidencias exactas, pero estas son las mejores opciones disponibles en ${ciudad || "tu zona"}.`;
      } else if (hayCoincidenciaEspecialidad) {
        resumenFinal = `Encontre ${resultadosFiltrados.length} optica${
          resultadosFiltrados.length === 1 ? "" : "s"
        } con experiencia en ${especialidad}.`;
      }

      setResults(resultadosFiltrados);
      setSummary(resumenFinal);
      setState("done");

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    } catch (error) {
      console.error("Error en Franklin:", error);
      await addStreamingMessage(
        "Hubo un problema procesando tu busqueda. Por favor, intenta de nuevo."
      );
      setState("done");
    }
  }, [query, state, opticas, opticasRanking, addStreamingMessage]);

  const reset = useCallback(() => {
    setState("idle");
    setMessages([]);
    setResults([]);
    setSummary("");
    setQuery("");
  }, []);

  return {
    query,
    setQuery,
    state,
    messages,
    results,
    summary,
    processQuery,
    reset,
    resultsRef,
  };
}