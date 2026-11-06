"use client";

import { Laptop, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function DesktopOnlyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ========================================== */}
      {/* VISTA MÓVIL: Mensaje elegante de restricción */}
      {/* ========================================== */}
      <div className="md:hidden min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full">
          {/* Icono principal */}
          <div className="w-20 h-20 bg-gold-500/10 border-2 border-gold-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Laptop className="w-10 h-10 text-gold-400" />
          </div>

          {/* Título y mensaje */}
          <h1 className="text-2xl md:text-3xl font-bold text-white font-display mb-4">
            Panel de Control
          </h1>
          <p className="text-navy-200 text-base leading-relaxed mb-6">
            Para ofrecerte la mejor experiencia de gestión y visualización de datos, 
            esta sección está optimizada exclusivamente para <strong className="text-gold-400">pantallas de computadora o tabletas</strong>.
          </p>

          {/* Reaseguramiento */}
          <div className="bg-navy-800/50 border border-navy-700 rounded-lg p-4 mb-8 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300 text-left">
              Tu información está segura. Por favor, accede a tu panel desde tu laptop o PC para continuar administrando tu óptica.
            </p>
          </div>

          {/* Botón de regreso */}
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-white text-navy-900 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>

      {/* ========================================== */}
      {/* VISTA ESCRITORIO: Contenido real del Dashboard */}
      {/* ========================================== */}
      <div className="hidden md:block">
        {children}
      </div>
    </>
  );
}