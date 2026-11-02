"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, LayoutDashboard, LogOut, Home } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const { usuario, cerrarSesion } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO - Siempre lleva al HOME */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-navy-900 rounded-lg flex items-center justify-center group-hover:bg-navy-800 transition-colors shadow-sm">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-lg text-navy-900 leading-tight">
                La Óptica Cerca de mí
              </p>
              <p className="text-[10px] text-gray-500 -mt-1">Directorio de ópticas</p>
            </div>
          </Link>

          {/* NAVEGACIÓN CENTRAL */}
<nav className="hidden md:flex items-center gap-1">
  <Link 
    href="/opticas" 
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname?.startsWith("/opticas") 
        ? "bg-navy-50 text-navy-900 font-semibold" 
        : "text-gray-600 hover:bg-gray-50 hover:text-navy-900"
    }`}
  >
    Directorio
  </Link>
  <Link 
    href="/planes" 
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname?.startsWith("/planes") 
        ? "bg-navy-50 text-navy-900 font-semibold" 
        : "text-gray-600 hover:bg-gray-50 hover:text-navy-900"
    }`}
  >
    Planes
  </Link>
  <Link 
    href="/contacto-publicidad" 
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname?.startsWith("/contacto") 
        ? "bg-navy-50 text-navy-900 font-semibold" 
        : "text-gray-600 hover:bg-gray-50 hover:text-navy-900"
    }`}
  >
    Publicidad
  </Link>
</nav>

          {/* ÁREA DE USUARIO */}
          <div className="flex items-center gap-3">
            {/* Botón HOME (solo visible si NO estás en home) */}
            {!isHome && (
              <Link 
                href="/"
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                title="Volver al inicio"
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </Link>
            )}

            {usuario ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Mi Dashboard</span>
                </Link>
                
                <button 
                  onClick={cerrarSesion}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-sm font-medium text-navy-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link 
                  href="/login?redirect=/registro" 
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Registra tu óptica
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}