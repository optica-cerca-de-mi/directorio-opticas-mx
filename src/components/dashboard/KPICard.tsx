"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  etiqueta: string;
  valor: string | number;
  sufijo?: string;
  variacion: number; // % o unidades
  icono: React.ReactNode;
  colorIcono: string;
  invertido?: boolean; // Si true, variación negativa es buena (ej: posición)
  subtitulo?: string;
}

export default function KPICard({
  etiqueta,
  valor,
  sufijo,
  variacion,
  icono,
  colorIcono,
  invertido = false,
  subtitulo,
}: KPICardProps) {
  const esPositivo = invertido ? variacion < 0 : variacion > 0;
  const esNeutro = variacion === 0;

  const colorVariacion = esNeutro
    ? "text-gray-500"
    : esPositivo
    ? "text-green-600"
    : "text-red-600";

  const IconoVariacion = esNeutro ? Minus : esPositivo ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorIcono}`}>
          {icono}
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${colorVariacion}`}>
          <IconoVariacion className="w-3 h-3" />
          <span>
            {variacion > 0 ? "+" : ""}
            {variacion}
            {invertido ? "" : "%"}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">
        {etiqueta}
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-navy-900 font-display">
          {valor}
        </span>
        {sufijo && <span className="text-sm text-gray-500">{sufijo}</span>}
      </div>
      {subtitulo && (
        <p className="text-[11px] text-gray-400 mt-1">{subtitulo}</p>
      )}
    </div>
  );
}