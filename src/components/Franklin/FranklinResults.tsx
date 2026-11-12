"use client";

import Link from "next/link";
import { Sparkles, X, Loader2, CheckCircle2, MapPin, Star, ArrowRight } from "lucide-react";
import { estaAbiertaEn } from "@/lib/ranking-engine";
import type { FranklinMessage, OpticaTop } from "./hooks/useFranklin";

interface FranklinResultsProps {
  state: "idle" | "thinking" | "done";
  messages: FranklinMessage[];
  results: OpticaTop[];
  summary: string;
  onReset: () => void;
  resultsRef: React.RefObject<HTMLDivElement | null>;
}

export default function FranklinResults({
  state,
  messages,
  results,
  summary,
  onReset,
  resultsRef,
}: FranklinResultsProps) {
  if (state === "idle") return null;

  return (
    <section ref={resultsRef} className="py-16 bg-gradient-to-br from-gold-50 to-white border-b border-gold-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header del panel */}
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-400 to-amber-500 rounded-full animate-ping opacity-30"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-gold-400 via-amber-400 to-gold-600 rounded-full flex items-center justify-center shadow-lg shadow-gold-400/50 animate-pulse">
                  <Sparkles className="w-5 h-5 text-white drop-shadow-md" />
                </div>
              </div>
              <div>
                <p className="font-bold font-display">Franklin</p>
                <p className="text-xs text-gray-300">Impulsado por Qwen AI</p>
              </div>
            </div>
            {state === "done" && (
              <button
                onClick={onReset}
                className="text-gray-300 hover:text-white transition-colors"
                title="Nueva busqueda"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mensajes streaming */}
          <div className="p-6 space-y-3 min-h-[120px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 transition-all duration-500 ${
                  msg.type === "success"
                    ? "bg-green-50 border border-green-200 rounded-lg p-3"
                    : "py-1"
                }`}
                style={{ animation: "fadeIn 0.4s ease-out" }}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    msg.type === "success" ? "bg-green-500 scale-100" : "bg-navy-100 scale-95"
                  }`}
                >
                  {msg.type === "thinking" ? (
                    <Loader2 className="w-4 h-4 text-navy-700 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                </div>
                <p
                  className={`text-sm transition-all duration-300 ${
                    msg.type === "success" ? "text-green-900 font-semibold" : "text-gray-700"
                  }`}
                >
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          {/* Resultados */}
          {state === "done" && results.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-navy-900 font-display">{summary}</h3>
                <Link
                  href="/opticas"
                  className="text-sm text-navy-700 hover:text-navy-900 font-semibold flex items-center gap-1"
                >
                  Ver todas <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.map((optica) => {
                  const { abierta } = estaAbiertaEn(optica.horarios || []);
                  const imagen = optica.fotos?.[0]?.url;
                  return (
                    <Link
                      key={optica.id}
                      href={`/opticas/${optica.slug || optica.id}`}
                      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                        {imagen ? (
                          <img
                            src={imagen}
                            alt={optica.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-100 to-navy-200">
                            <MapPin className="w-10 h-10 text-navy-400" />
                          </div>
                        )}
                        {(optica.plan === "premium_plus" || optica.plan === "premium") && (
                          <div className="absolute top-2 right-2">
                            <span
                              className={`px-2 py-0.5 text-white text-[9px] font-bold rounded-full ${
                                optica.plan === "premium_plus" ? "bg-amber-500" : "bg-navy-900"
                              }`}
                            >
                              {optica.plan === "premium_plus" ? "PREMIUM+" : "PREMIUM"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-navy-900 text-sm mb-1 line-clamp-1">
                          {optica.nombre}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {optica.ciudad}
                          {optica.estado ? `, ${optica.estado}` : ""}
                        </p>
                        {optica.calificacionGoogle && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                            <span className="text-xs font-bold text-navy-900">
                              {optica.calificacionGoogle}
                            </span>
                            <span className="text-xs text-gray-500">({optica.numResenas})</span>
                          </div>
                        )}
                        <div className="mt-2">
                          {abierta ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Abierta
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-semibold rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Cerrada
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}