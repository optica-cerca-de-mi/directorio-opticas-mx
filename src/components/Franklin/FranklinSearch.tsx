"use client";

import { Sparkles, Search, Loader2, Filter, Clock, BadgeCheck, LocateFixed, Star } from "lucide-react";
import type { ActiveFilters } from "./hooks/useFranklin";

interface FranklinSearchProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  isThinking: boolean;
  sugerencias?: string[];
  activeFilters: ActiveFilters;
  setActiveFilters: (filters: ActiveFilters) => void;
}

const SUGERENCIAS_DEFAULT = [
  "Me empeoro la vista, necesito examen",
  "Lentes de contacto en CDMX",
  "Optica que acepte GNP",
  "Lentes para computadora",
];

export default function FranklinSearch({
  query,
  setQuery,
  onSearch,
  isThinking,
  sugerencias = SUGERENCIAS_DEFAULT,
  activeFilters,
  setActiveFilters,
}: FranklinSearchProps) {
  const toggleFilter = (key: keyof ActiveFilters) => {
    setActiveFilters({
      ...activeFilters,
      [key]: !activeFilters[key],
    });
  };

  const hayFiltrosActivos = Object.values(activeFilters).some((v) => v === true);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-5">
        {/* Header Franklin */}
        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-gray-100">
          <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-400 to-amber-500 rounded-full animate-ping opacity-40"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-gold-400 via-amber-400 to-gold-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white drop-shadow-md" />
            </div>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-navy-900 font-display">
              Franklin <span className="text-xs font-normal text-gray-500">AI</span>
            </p>
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Tecnologia impulsada por Qwen AI
            </p>
          </div>
        </div>

        {/* Input + Botón */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch();
              }}
              placeholder="Describe tu problema o escribe una especialidad, seguro o ciudad..."
              className="w-full h-14 md:h-12 px-4 text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-base"
            />
          </div>

          <button
            onClick={onSearch}
            disabled={isThinking || !query.trim()}
            className="w-full md:w-auto h-14 md:h-12 px-6 bg-navy-900 hover:bg-navy-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
          >
            {isThinking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Busqueda Inteligente</span>
              </>
            )}
          </button>
        </div>

        {/* ✅ FILTROS MULTI-CRITERIO ACTUALIZADOS */}
        <div className="pt-3 mt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-semibold text-gray-600">Filtros rapidos:</span>
            {hayFiltrosActivos && (
              <button
                onClick={() => setActiveFilters({})}
                className="text-xs text-navy-700 hover:underline ml-auto"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleFilter("abiertoAhora")}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${
                activeFilters.abiertoAhora
                  ? "bg-green-100 border-green-300 text-green-800 font-semibold"
                  : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Clock className="w-3 h-3" />
              Abierto ahora
            </button>

            <button
              onClick={() => toggleFilter("soloVerificadas")}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${
                activeFilters.soloVerificadas
                  ? "bg-blue-100 border-blue-300 text-blue-800 font-semibold"
                  : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <BadgeCheck className="w-3 h-3" />
              Solo verificadas
            </button>

            <button
              onClick={() => toggleFilter("cercaDeMi")}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${
                activeFilters.cercaDeMi
                  ? "bg-purple-100 border-purple-300 text-purple-800 font-semibold"
                  : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <LocateFixed className="w-3 h-3" />
              Cerca de mi (5 km)
            </button>

            <button
              onClick={() => toggleFilter("mejorCalificadas")}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${
                activeFilters.mejorCalificadas
                  ? "bg-amber-100 border-amber-300 text-amber-800 font-semibold"
                  : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Star className="w-3 h-3" />
              Mejor calificadas
            </button>
          </div>
        </div>

        {/* Sugerencias rápidas */}
        <div className="pt-3 mt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {sugerencias.map((sug, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sug);
                  setTimeout(() => onSearch(), 50);
                }}
                disabled={isThinking}
                className="text-xs bg-gray-100 hover:bg-navy-50 hover:border-navy-200 text-gray-700 px-3 py-2 rounded-full border border-gray-200 transition-colors disabled:opacity-50"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}