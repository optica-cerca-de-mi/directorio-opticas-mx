"use client";

import { useEffect, useRef } from "react";
import { X, ExternalLink, MapPin } from "lucide-react";

interface GoogleMapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  nombre: string;
  urlGoogleMaps: string;
}

export default function GoogleMapsModal({ isOpen, onClose, nombre, urlGoogleMaps }: GoogleMapsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Cerrar al hacer clic fuera
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Intentar convertir URL de Google Maps a embed
  const getEmbedUrl = (url: string): string | null => {
    try {
      // Si ya es un embed, usarlo directamente
      if (url.includes("/embed")) return url;

      // Extraer coordenadas
      const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordsMatch) {
        return `https://maps.google.com/maps?q=${coordsMatch[1]},${coordsMatch[2]}&output=embed`;
      }

      // Extraer query
      const queryMatch = url.match(/[?&]q=([^&]+)/);
      if (queryMatch) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(queryMatch[1]))}&output=embed`;
      }

      // Extraer place
      const placeMatch = url.match(/\/place\/([^/@]+)/);
      if (placeMatch) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')))}&output=embed`;
      }

      return null;
    } catch {
      return null;
    }
  };

  const embedUrl = getEmbedUrl(urlGoogleMaps);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <p className="font-bold font-display text-lg">{nombre}</p>
              <p className="text-xs text-gray-300">Ficha oficial de Google Maps</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={urlGoogleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Abrir en Google Maps"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {embedUrl ? (
            <div className="aspect-video rounded-xl overflow-hidden border border-gray-200">
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Ficha de Google Maps de ${nombre}`}
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
              <div className="text-center p-6">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-semibold mb-2">No se puede embeber esta ficha</p>
                <p className="text-sm text-gray-500 mb-4">
                  Pero puedes verla directamente en Google Maps
                </p>
                <a
                  href={urlGoogleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver ficha en Google Maps
                </a>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span>Calificación y reseñas actualizadas en tiempo real por Google</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}