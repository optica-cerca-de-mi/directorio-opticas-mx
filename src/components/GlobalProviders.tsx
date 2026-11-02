"use client";

import { Suspense } from "react"; // ✅ 1. AGREGAMOS ESTE IMPORT
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/layout/Header";
import CookieConsent from "@/components/CookieConsent";
import LocationConsent from "@/components/LocationConsent";

export default function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* HEADER GLOBAL - Visible en TODAS las páginas */}
      <Header />
      
      {/* Contenido principal */}
      <div className="flex-1">{children}</div>

      {/* FOOTER GLOBAL */}
      <footer className="bg-navy-950 text-gray-400 border-t border-navy-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-navy-900"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  La Óptica Cerca de mí
                </p>
                <p className="text-xs text-gray-500">
                  © 2026 Todos los derechos reservados.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <a href="/terminos" className="hover:text-white transition-colors">
                Términos y condiciones
              </a>
              <a href="/privacidad" className="hover:text-white transition-colors">
                Aviso de privacidad
              </a>
              <button
                onClick={() => {
                  localStorage.removeItem("cookie_preferences");
                  window.location.reload();
                }}
                className="hover:text-white transition-colors underline underline-offset-2"
                title="Reabrir el panel de configuración de cookies"
              >
                Configurar cookies
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("location_consent");
                  localStorage.removeItem("user_location");
                  window.location.reload();
                }}
                className="hover:text-white transition-colors underline underline-offset-2"
                title="Reabrir el permiso de ubicación"
              >
                Configurar ubicación
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ✅ 2. ENVOLVEMOS ESTOS COMPONENTES EN SUSPENSE */}
      <Suspense fallback={null}>
        <CookieConsent />
        <LocationConsent />
      </Suspense>
    </AuthProvider>
  );
}