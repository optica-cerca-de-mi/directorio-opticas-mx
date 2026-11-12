"use client";

interface BarChartProps {
  datos: Array<{ origen: string; cantidad: number; porcentaje: number; color: string }>;
}

export default function BarChart({ datos }: BarChartProps) {
  const max = Math.max(...datos.map((d) => d.cantidad), 1);

  return (
    <div className="space-y-3">
      {datos.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">{d.origen}</span>
            <span className="text-xs text-gray-500">
              {d.cantidad} ({d.porcentaje}%)
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${(d.cantidad / max) * 100}%`,
                backgroundColor: d.color,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}