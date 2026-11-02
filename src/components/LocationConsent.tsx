"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, X, Navigation, Shield, AlertCircle } from "lucide-react";

export default function LocationConsent() {
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "granted" | "denied" | "error">("idle");

  const searchParams = useSearchParams();
  const resetLocation = searchParams.get("reset_location");

  // Al cargar, verificar preferencia guardada
  useEffect(() => {
    // Si hay parámetro ?reset_location=true, limpiar y mostrar modal
    if (resetLocation === "true") {
      localStorage.removeItem("location_consent");
      localStorage.removeItem("user_location");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      setShowModal(true);
      return;
    }

    const consent = localStorage.getItem("location_consent");
    const savedLocation = localStorage.getItem("user_location");

    if (consent === "granted" && savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
        setStatus("granted");
      } catch (e) {
        setShowModal(true);
      }
    } else if (consent === "denied") {
      setStatus("denied");
      // No mostrar modal automáticamente si ya fue denegado
    } else {
      // Primera vez: mostrar modal después de 1.5 segundos
      const timer = setTimeout(() => setShowModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [resetLocation]);

  const handleAccept = () => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(coords);
        setStatus("granted");
        localStorage.setItem("location_consent", "granted");
        localStorage.setItem("user_location", JSON.stringify(coords));
        setShowModal(false);
        setLoading(false);

        // Disparar evento personalizado para que otras partes de la app se enteren
        window.dispatchEvent(new CustomEvent("locationUpdated", { detail: coords }));
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          setError("Permiso denegado. Puedes activarlo manualmente en la configuración de tu navegador.");
          setStatus("denied");
          localStorage.setItem("location_consent", "denied");
        } else if (err.code === 2) {
          setError("Ubicación no disponible. Verifica que tu dispositivo tenga GPS activo.");
        } else {
          setError("Tiempo de espera agotado. Intenta de nuevo.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleDeny = () => {
    setStatus("denied");
    localStorage.setItem("location_consent", "denied");
    setShowModal(false);
  };

  const handleRetry = () => {
    localStorage.removeItem("location_consent");
    localStorage.removeItem("user_location");
    setStatus("idle");
    setShowModal(true);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-700 p-6 text-white relative">
          <button
            onClick={handleDeny}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
            <Navigation className="w-7 h-7 text-gold-400" />
          </div>
          <h2 className="text-xl font-bold font-display mb-1">
            ¿Quieres ver ópticas cercanas a ti?
          </h2>
          <p className="text-sm text-navy-100">
            Personaliza tu búsqueda con tu ubicación
          </p>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {error ? (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="mt-3 text-sm font-semibold text-navy-700 hover:underline"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Permite el acceso a tu ubicación para mostrarte las ópticas más cercanas 
              primero y mejorar tu experiencia de búsqueda.
            </p>
          )}

          {/* Nota de privacidad */}
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg mb-6">
            <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600">
              <strong className="text-gray-700">Tu privacidad es importante:</strong> Tu 
              ubicación nunca se comparte con terceros. Solo se usa en tu navegador para 
              ordenar los resultados.
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDeny}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Ahora no
            </button>
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Obteniendo ubicación...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Sí, usar mi ubicación
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}