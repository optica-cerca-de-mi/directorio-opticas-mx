"use client";

import { exportarMetricasParaDashboard } from "@/lib/ranking-metrics";

export default function RankingDashboard() {
  const metricas = exportarMetricasParaDashboard();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Recomendación</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card-premium p-6">
          <h3 className="text-sm text-gray-600 mb-2">Tasa de Conversión</h3>
          <p className="text-3xl font-bold text-navy-900">
            {metricas.resumen.tasaConversion}
          </p>
        </div>
        
        <div className="card-premium p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Eventos</h3>
          <p className="text-3xl font-bold text-navy-900">
            {metricas.resumen.totalEventos}
          </p>
        </div>
        
        <div className="card-premium p-6">
          <h3 className="text-sm text-gray-600 mb-2">Top Óptica</h3>
          <p className="text-lg font-bold text-navy-900 truncate">
            {metricas.resumen.topOpticas[0] || "Sin datos"}
          </p>
        </div>
      </div>

      <div className="card-premium p-6">
        <h3 className="text-lg font-bold mb-4">Eventos Recientes</h3>
        <div className="space-y-2">
          {metricas.eventosRecientes.map((evento, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{evento.tipo}</span>
              <span>{evento.opticaId}</span>
              <span>{evento.timestamp.toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}