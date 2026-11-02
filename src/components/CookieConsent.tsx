"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { X, ShieldCheck, BarChart3, Megaphone, Settings, Check } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  const searchParams = useSearchParams();
  const resetCookies = searchParams.get("reset_cookies");

  // Verificar preferencias guardadas o resetear si hay parámetro
  useEffect(() => {
    // Si hay parámetro ?reset_cookies=true, limpiar y mostrar banner
    if (resetCookies === "true") {
      localStorage.removeItem("cookie_preferences");
      // Limpiar el parámetro de la URL sin recargar
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      setShowBanner(true);
      return;
    }

    const savedPreferences = localStorage.getItem("cookie_preferences");
    if (!savedPreferences) {
      setShowBanner(true);
    } else {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        setShowBanner(true);
      }
    }
  }, [resetCookies]);

  const handleAcceptAll = () => {
    const newPrefs = { necessary: true, analytics: true, marketing: true };
    savePreferences(newPrefs);
  };

  const handleEssentialOnly = () => {
    const newPrefs = { necessary: true, analytics: false, marketing: false };
    savePreferences(newPrefs);
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
    setShowModal(false);
  };

  const savePreferences = (prefs: any) => {
    localStorage.setItem("cookie_preferences", JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowModal(false);
  };

  const openSettings = () => {
    setShowBanner(false);
    setShowModal(true);
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* BANNER INFERIOR */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl p-4 md:p-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-gold-500" />
                Respetamos tu privacidad
              </h3>
              <p className="text-sm text-gray-600">
                Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y mostrar publicidad personalizada. 
                Puedes aceptar todas, usar solo las esenciales o personalizar tu elección. 
                <button onClick={() => setShowModal(true)} className="text-navy-700 font-semibold underline ml-1 hover:text-navy-900">
                  Leer más
                </button>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={handleEssentialOnly}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Solo esenciales
              </button>
              <button
                onClick={openSettings}
                className="px-4 py-2 text-sm font-semibold text-navy-700 bg-navy-50 hover:bg-navy-100 border border-navy-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Personalizar
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors shadow-md"
              >
                Aceptar todas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PERSONALIZACIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-navy-900 font-display">Configuración de Cookies</h2>
                <p className="text-sm text-gray-500 mt-1">Administra tus preferencias de privacidad</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                A continuación puedes elegir qué tipos de cookies permites. Las cookies necesarias siempre están activas porque son esenciales para que el sitio funcione correctamente.
              </p>

              {/* Opción 1: Necesarias */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-navy-900">Estrictamente necesarias</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Esenciales para la navegación y el funcionamiento básico del sitio (ej. mantener tu sesión iniciada). No se pueden desactivar.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex-shrink-0">
                  <Check className="w-3 h-3" />
                  Siempre activas
                </div>
              </div>

              {/* Opción 2: Analíticas */}
              <div className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-navy-200 transition-colors">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-navy-900">Cookies analíticas</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Nos ayudan a entender cómo interactúas con el sitio (ej. Google Analytics) para mejorar el contenido y la estructura. No identifican personalmente.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input 
                    type="checkbox" 
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-900"></div>
                </label>
              </div>

              {/* Opción 3: Marketing */}
              <div className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-navy-200 transition-colors">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Megaphone className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-navy-900">Cookies de marketing</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Se utilizan para mostrarte anuncios relevantes (ej. Google Ads) y medir la efectividad de las campañas publicitarias.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input 
                    type="checkbox" 
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-900"></div>
                </label>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCustom}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors shadow-md"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}