"use client";

import { Crown } from "lucide-react";
import { useConfig } from "@/hooks/useConfig";

export default function AdminPlanes() {
  const { data: planesData, loading } = useConfig("planes");
  const planes = planesData?.items || [];

  if (loading) return <div className="p-8 text-center text-gray-600">Cargando planes...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 font-display mb-2 flex items-center gap-3">
            <Crown className="w-8 h-8" />
            Planes y Precios
          </h1>
          <p className="text-gray-600">Gestiona los planes disponibles y sus precios. (Edición avanzada próximamente)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planes.map((plan: any) => (
          <div key={plan.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-navy-900 text-lg">{plan.nombre}</h3>
                <p className="text-xs text-gray-500 font-mono">{plan.id}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-xs text-gray-600">Mensual</span>
                <span className="font-bold text-navy-900">${plan.precioMensual}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-xs text-gray-600">Anual</span>
                <span className="font-bold text-navy-900">${plan.precioAnual}</span>
              </div>
              {plan.ahorroAnual && (
                <div className="text-xs text-green-600 font-semibold text-center">✓ {plan.ahorroAnual}</div>
              )}
            </div>

            <p className="text-xs text-gray-600 italic mb-4">{plan.descripcion}</p>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Características:</p>
              <ul className="space-y-1">
                {plan.caracteristicas.map((c: string, i: number) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-green-600 mt-0.5">✓</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}