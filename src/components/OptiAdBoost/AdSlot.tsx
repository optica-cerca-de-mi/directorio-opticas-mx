"use client";

import { Globe, Megaphone } from "lucide-react";
import { getAdSlot } from "./ad-config";

interface AdSlotProps {
  slotId: string;
  className?: string;
}

export default function AdSlot({ slotId, className = "" }: AdSlotProps) {
  const config = getAdSlot(slotId);

  // Si el slot no existe o está inactivo, no renderizar nada
  if (!config || !config.activo) return null;

  // ✅ CUANDO TENGAS GOOGLE ADS:
  // Reemplaza este bloque por el script de Google Ads
  // Ejemplo:
  // <ins className="adsbygoogle" data-ad-client="ca-pub-XXXX" data-ad-slot="YYYY" />

  return (
    <div className={`w-full ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Label "Publicidad" sutil */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-gray-100/50 border-b border-gray-200">
            <div className="flex items-center gap-1.5">
              <Megaphone className="w-3 h-3 text-gray-400" />
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                Publicidad
              </p>
            </div>
            <p className="text-[9px] text-gray-300 font-mono">{slotId}</p>
          </div>

          {/* Contenido del placeholder */}
          <div className="min-h-[90px] flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Globe className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">
                Espacio publicitario disponible
              </p>
              <p className="text-[10px] text-gray-400">
                {config.descripcion}
              </p>
              <p className="text-[9px] text-gray-300 mt-2 font-mono">
                Tipo: {config.tipo} • Listo para Google Ads
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}