"use client";

import { Star, ExternalLink, MapPin } from "lucide-react";

interface GoogleLiveBadgeProps {
  nombre: string;
  calificacion?: number;
  numResenas?: number;
  urlGoogleMaps?: string;
}

export default function GoogleLiveBadge({ nombre, calificacion, numResenas, urlGoogleMaps }: GoogleLiveBadgeProps) {
  // Si no hay URL de Google Maps, mostramos los datos estáticos de Firebase (fallback)
  if (!urlGoogleMaps) {
    return (
      <div className="flex items-center gap-2">
        {calificacion && (
          <>
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <span className="font-bold text-navy-900">{calificacion}</span>
            {numResenas && <span className="text-sm text-gray-600">({numResenas})</span>}
          </>
        )}
      </div>
    );
  }

  // ✅ ESTRATEGIA GRATUITA: Enlace directo a la ficha real de Google
  return (
    <a 
      href={urlGoogleMaps} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
        <MapPin className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 truncate">Ver en Google Maps</p>
        <p className="text-[10px] text-gray-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Calificación y reseñas en vivo
        </p>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
    </a>
  );
}