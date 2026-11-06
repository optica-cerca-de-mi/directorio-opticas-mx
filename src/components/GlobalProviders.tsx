"use client";

import { Suspense } from "react";
import Link from "next/link"; // ✅ Agregado para navegación interna rápida
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/layout/Header";
import CookieConsent from "@/components/CookieConsent";
import LocationConsent from "@/components/LocationConsent";

export default function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* HEADER GLOBAL */}
      <Header />

      {/* Contenido principal */}
      <div className="flex-1">{children}</div>

      {/* FOOTER GLOBAL - Actualizado con enlaces legales y estilo premium */}
      <footer className="bg-navy-900 text-gray-300 border-t border-gold-900/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            {/* Columna 1: Marca */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-navy-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white font-display">La Óptica Cerca de mí</span>
              </div>
              <p className="text-sm text-gray-400">
                El directorio #1 de ópticas en México. Conectamos tu negocio con más clientes.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                © {new Date().getFullYear()} Orange Point. Todos los derechos reservados.
              </p>
            </div>

            {/* Columna 2: Enlaces Legales */}
            <div>
              <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/terminos-y-condiciones" className="hover:text-gold-300 transition-colors flex items-center gap-2">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/aviso-de-privacidad" className="hover:text-gold-300 transition-colors flex items-center gap-2">
                    Aviso de Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/politica-de-reembolsos" className="hover:text-gold-300 transition-colors flex items-center gap-2">
                    Política de Reembolsos
                  </Link>
                </li>
                <li>
                  <Link href="/politica-de-cookies" className="hover:text-gold-300 transition-colors flex items-center gap-2">
                    Política de Cookies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 3: Preferencias */}
            <div>
              <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">Preferencias</h4>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    localStorage.removeItem("cookie_preferences");
                    window.location.reload();
                  }}
                  className="text-sm text-gray-300 hover:text-gold-300 transition-colors flex items-center gap-2 underline underline-offset-4 decoration-gray-600 hover:decoration-gold-300"
                >
                  Configurar cookies
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("location_consent");
                    localStorage.removeItem("user_location");
                    window.location.reload();
                  }}
                  className="text-sm text-gray-300 hover:text-gold-300 transition-colors flex items-center gap-2 underline underline-offset-4 decoration-gray-600 hover:decoration-gold-300"
                >
                  Configurar ubicación
                </button>
              </div>
            </div>
          </div>

          {/* Línea divisoria inferior */}
          <div className="border-t border-navy-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>Operado por Orange Point</p>
            <div className="flex gap-4">
              <span>Hecho con ❤️ y orgullosamente en México</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Componentes de consentimiento */}
      <Suspense fallback={null}>
        <CookieConsent />
        <LocationConsent />
      </Suspense>
    </AuthProvider>
  );
}