"use client";

interface DonutSegment {
  valor: number;
  color: string;
  etiqueta: string;
}

interface DonutChartProps {
  segmentos: DonutSegment[];
  tamano?: number;
  grosor?: number;
  centroTexto?: string;
}

export default function DonutChart({
  segmentos,
  tamano = 140,
  grosor = 22,
  centroTexto,
}: DonutChartProps) {
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const total = segmentos.reduce((sum, s) => sum + s.valor, 0);

  let offsetAcumulado = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={tamano} height={tamano} className="-rotate-90">
        {/* Fondo gris sutil */}
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={grosor}
        />
        {segmentos.map((seg, i) => {
          const porcentaje = seg.valor / total;
          const longitud = circunferencia * porcentaje;
          const offset = circunferencia - offsetAcumulado;
          offsetAcumulado += longitud;

          return (
            <circle
              key={i}
              cx={tamano / 2}
              cy={tamano / 2}
              r={radio}
              fill="none"
              stroke={seg.color}
              strokeWidth={grosor}
              strokeDasharray={`${longitud} ${circunferencia}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          );
        })}
      </svg>
      {centroTexto && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-navy-900 font-display">
            {centroTexto}
          </span>
        </div>
      )}
    </div>
  );
}