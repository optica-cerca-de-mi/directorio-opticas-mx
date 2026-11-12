"use client";

interface LineChartProps {
  datos: Array<{ fecha: string; visitas: number; whatsapp: number }>;
  ancho?: number;
  alto?: number;
}

export default function LineChart({
  datos,
  ancho = 600,
  alto = 220,
}: LineChartProps) {
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const anchoInterno = ancho - padding.left - padding.right;
  const altoInterno = alto - padding.top - padding.bottom;

  const maxVisitas = Math.max(...datos.map((d) => d.visitas), 1);
  const maxWA = Math.max(...datos.map((d) => d.whatsapp), 1);
  const maxGlobal = Math.max(maxVisitas, maxWA);

  const pasoX = anchoInterno / (datos.length - 1);

  const puntosVisitas = datos.map((d, i) => ({
    x: padding.left + i * pasoX,
    y: padding.top + altoInterno - (d.visitas / maxGlobal) * altoInterno,
  }));

  const puntosWA = datos.map((d, i) => ({
    x: padding.left + i * pasoX,
    y: padding.top + altoInterno - (d.whatsapp / maxGlobal) * altoInterno,
  }));

  const pathVisitas = puntosVisitas
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const pathWA = puntosWA
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Área bajo la curva de visitas (degradado)
  const areaPath = `${pathVisitas} L ${puntosVisitas[puntosVisitas.length - 1].x} ${
    padding.top + altoInterno
  } L ${puntosVisitas[0].x} ${padding.top + altoInterno} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="gradVisitas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Líneas de referencia horizontales */}
        {[0.25, 0.5, 0.75, 1].map((fraccion, i) => (
          <line
            key={i}
            x1={padding.left}
            x2={ancho - padding.right}
            y1={padding.top + altoInterno - fraccion * altoInterno}
            y2={padding.top + altoInterno - fraccion * altoInterno}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        ))}

        {/* Área bajo visitas */}
        <path d={areaPath} fill="url(#gradVisitas)" />

        {/* Línea de visitas */}
        <path
          d={pathVisitas}
          fill="none"
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Línea de WhatsApp */}
        <path
          d={pathWA}
          fill="none"
          stroke="#d4af37"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Puntos */}
        {puntosVisitas.map((p, i) => (
          <circle key={`v-${i}`} cx={p.x} cy={p.y} r="4" fill="#0f172a" />
        ))}
        {puntosWA.map((p, i) => (
          <circle key={`w-${i}`} cx={p.x} cy={p.y} r="4" fill="#d4af37" />
        ))}

        {/* Etiquetas de fecha */}
        {datos.map((d, i) => (
          <text
            key={i}
            x={padding.left + i * pasoX}
            y={alto - 10}
            textAnchor="middle"
            className="text-xs fill-gray-500"
            fontSize="11"
          >
            {d.fecha}
          </text>
        ))}
      </svg>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-navy-900"></span>
          <span className="text-gray-600">Visitas a ficha</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span className="text-gray-600">Clics WhatsApp</span>
        </div>
      </div>
    </div>
  );
}