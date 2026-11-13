"use client";

import { useState, useRef, useCallback } from "react";
import {
  filtrarPorEspecialidad,
  filtrarPorCiudad,
  filtrarPorSeguro,
  aplicarScoring,
} from "@/lib/search-utils";
import { estaAbiertaEn } from "@/lib/ranking-engine";
import { registrarBusquedaFranklin } from "@/lib/franklin-analytics";

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

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
  latitud?: number;
  longitud?: number;
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

export interface ActiveFilters {
  abiertoAhora?: boolean;
  soloVerificadas?: boolean;
  cercaDeMi?: boolean; // Activa geolocalización y filtro de 5km
  mejorCalificadas?: boolean; // Ordena por calificaciónGoogle
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
  activeFilters: ActiveFilters;
  setActiveFilters: (filters: ActiveFilters) => void;
  processQuery: () => Promise<void>;
  reset: () => void;
  resultsRef: React.RefObject<HTMLDivElement | null>;
  ubicacionUsuario: { lat: number; lng: number } | null;
}

interface UseFranklinProps {
  opticas: OpticaTop[];
  opticasRanking: OpticaTop[];
}

// ═══════════════════════════════════════════════════════════════
// UTILIDAD: Calcular distancia entre dos puntos (fórmula Haversine)
// ═══════════════════════════════════════════════════════════════

function calcularDistanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
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

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function useFranklin({ opticas, opticasRanking }: UseFranklinProps): UseFranklinReturn {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"idle" | "thinking" | "done">("idle");
  const [messages, setMessages] = useState<FranklinMessage[]>([]);
  const [results, setResults] = useState<OpticaTop[]>([]);
  const [summary, setSummary] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [ubicacionUsuario, setUbicacionUsuario] = useState<{ lat: number; lng: number } | null>(null);
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

  // ✅ Obtener ubicación del usuario cuando se activa "Cerca de mi"
  const obtenerUbicacionUsuario = useCallback((): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
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
      let ubicacionParaDistancia: { lat: number; lng: number } | null = ubicacionUsuario;

      for (const paso of aiData.pasos_pensamiento) {
        await addStreamingMessage(paso);
      }

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

      // 4. ✅ FILTROS MULTI-CRITERIO EN TIEMPO REAL

      // 4a. Abierto ahora
      if (activeFilters.abiertoAhora) {
        const antes = resultadosFiltrados.length;
        resultadosFiltrados = resultadosFiltrados.filter((optica) =>
          estaAbiertaEn(optica.horarios || []).abierta
        );
        if (resultadosFiltrados.length === 0 && antes > 0) {
          await addStreamingMessage("No hay opticas abiertas ahora con esos criterios.");
        }
      }

      // 4b. Solo verificadas
      if (activeFilters.soloVerificadas) {
        resultadosFiltrados = resultadosFiltrados.filter((optica) => optica.verificada);
      }

      // 4c. ✅ Cerca de mi (5 km)
      if (activeFilters.cercaDeMi) {
        let ubicacion = ubicacionUsuario;
        if (!ubicacion) {
          await addStreamingMessage("Obteniendo tu ubicacion para buscar opticas cercanas...");
          ubicacion = await obtenerUbicacionUsuario();
          if (ubicacion) {
            setUbicacionUsuario(ubicacion);
          }
        }

        if (ubicacion) {
          ubicacionParaDistancia = ubicacion;
          const antes = resultadosFiltrados.length;
          resultadosFiltrados = resultadosFiltrados
            .map((optica) => {
              if (!optica.latitud || !optica.longitud) return { ...optica, distanciaKm: null };
              const distancia = calcularDistanciaKm(ubicacion.lat, ubicacion.lng, optica.latitud, optica.longitud);
              return { ...optica, distanciaKm: distancia };
            })
            .filter((optica) => optica.distanciaKm === null || optica.distanciaKm <= 5)
            .sort((a, b) => {
              if (a.distanciaKm === null && b.distanciaKm === null) return 0;
              if (a.distanciaKm === null) return 1;
              if (b.distanciaKm === null) return -1;
              return a.distanciaKm - b.distanciaKm;
            });

          const despues = resultadosFiltrados.filter((o) => o.distanciaKm !== null && o.distanciaKm <= 5).length;
          if (despues === 0 && antes > 0) {
            await addStreamingMessage("No hay opticas a menos de 5 km de tu ubicacion.");
          } else if (despues > 0) {
            await addStreamingMessage(`Encontramos ${despues} optica${despues > 1 ? "s" : ""} a menos de 5 km de ti.`);
          }
        } else {
          await addStreamingMessage("No pudimos obtener tu ubicacion. Activa los permisos de geolocalizacion en tu navegador.");
        }
      }

      // 4d. ✅ Mejor calificadas (ordenamiento)
      if (activeFilters.mejorCalificadas) {
        resultadosFiltrados = resultadosFiltrados.sort((a, b) => {
          const califA = a.calificacionGoogle || 0;
          const califB = b.calificacionGoogle || 0;
          if (califB !== califA) return califB - califA;
          // Desempate por número de reseñas
          return (b.numResenas || 0) - (a.numResenas || 0);
        });
        await addStreamingMessage("Ordenando por mejor calificacion.");
      }

      // 5. Scoring base (si no hay filtro de mejor calificadas)
      if (!activeFilters.mejorCalificadas) {
        resultadosFiltrados = aplicarScoring(
          resultadosFiltrados,
          especialidad || undefined,
          ciudad || undefined
        );
      }

      // 6. Lógica estricta + Analytics de búsquedas fallidas
      if (resultadosFiltrados.length === 0) {
        await registrarBusquedaFranklin({
          query,
          timestamp: new Date(),
          filtros_detectados: { ciudad, especialidad, seguro },
          terminos_expandidos: aiData.terminos_expandidos || [],
          terminos_clinicos: aiData.terminos_clinicos || [],
          resultados_count: 0,
          opticas_devueltas: [],
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        });

        await addStreamingMessage(
          "No encontramos opticas que coincidan con tu busqueda. Te mostramos las mejores opciones disponibles."
        );
        const respaldo = opticasRanking.slice(0, 3);
        // ✅ Si "Cerca de mí" está activo, anotar distancias también en el respaldo (sin filtrar por 5 km, para transparencia)
        resultadosFiltrados = (ubicacionParaDistancia && activeFilters.cercaDeMi)
          ? respaldo.map((optica) => {
              if (!optica.latitud || !optica.longitud) return { ...optica, distanciaKm: null };
              const distancia = calcularDistanciaKm(ubicacionParaDistancia!.lat, ubicacionParaDistancia!.lng, optica.latitud, optica.longitud);
              return { ...optica, distanciaKm: distancia };
            })
          : respaldo;
      } else {
        resultadosFiltrados = resultadosFiltrados.slice(0, 6);
      }

      // Mensaje final
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
  }, [query, state, opticas, opticasRanking, activeFilters, ubicacionUsuario, addStreamingMessage, obtenerUbicacionUsuario]);

  const reset = useCallback(() => {
    setState("idle");
    setMessages([]);
    setResults([]);
    setSummary("");
    setQuery("");
    setActiveFilters({});
  }, []);

  return {
    query,
    setQuery,
    state,
    messages,
    results,
    summary,
    activeFilters,
    setActiveFilters,
    processQuery,
    reset,
    resultsRef,
    ubicacionUsuario,
  };
}