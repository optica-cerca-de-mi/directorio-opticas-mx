"use client";

import { useMemo } from "react";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Star } from "lucide-react";
import { calcularOptiRelevance, getNivelScore } from "@/lib/franklin-rank";

interface OptiRelevanceCardProps {
  optica: any;
}

export default function OptiRelevanceCard({ optica }: OptiRelevanceCardProps) {
  const scoreData = useMemo(() => {
    return calcularOptiRelevance(optica);
  }, [optica]);

  const nivel = getNivelScore(scoreData.scoreTotal);

  const colorClasses: Record<string, string> = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  const badgeClasses: Record<string, string> = {
    green: "bg-green-100 text-green-800 border-green-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    red: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="bg-gradient-to-br from-navy-50 to-white border border-navy-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy-900">Índice de Relevancia Franklin</h3>
            <p className="text-xs text-gray-500">Qué tan visible eres para los pacientes</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${badgeClasses[nivel.color]}`}>
          {nivel.nivel}
        </span>
      </div>

      <div className="flex items-end gap-3 mb-2">
        <span className="text-4xl font-bold text-navy-900">{nivel.porcentaje}</span>
        <span className="text-sm text-gray-500 mb-1">/ 100 puntos</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${colorClasses[nivel.color]}`}
          style={{ width: `${nivel.porcentaje}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Relevancia</p>
          <p className="text-lg font-bold text-navy-900">{scoreData.scoreRelevancia}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Calidad de Ficha</p>
          <p className="text-lg font-bold text-navy-900">{scoreData.scoreQuality}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Performance</p>
          <p className="text-lg font-bold text-navy-900">{scoreData.scorePerformance}</p>
        </div>
      </div>

      {scoreData.sugerencias.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-navy-700" />
            <h4 className="text-sm font-bold text-navy-900">Acciones para mejorar tu posición:</h4>
          </div>
          <ul className="space-y-2">
            {scoreData.sugerencias.slice(0, 3).map((sugerencia, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{sugerencia}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">¡Excelente! Tu ficha está optimizada al máximo para Franklin.</span>
        </div>
      )}
    </div>
  );
}