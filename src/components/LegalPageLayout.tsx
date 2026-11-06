"use client";

import Link from "next/link";
import { Shield, ArrowLeft, Scale, Cookie, RefreshCw, FileText } from "lucide-react";

interface LegalPageLayoutProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({
  icon,
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50 to-white">
      {/* Header */}
      <div className="bg-navy-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gold-300 hover:text-gold-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver al inicio</span>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gold-500/20 border-2 border-gold-400 rounded-lg flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-white">
                {title}
              </h1>
              <p className="text-gold-200 mt-2 text-lg">{subtitle}</p>
            </div>
          </div>
          <p className="text-navy-200 text-sm mt-6">
            Última actualización: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="prose prose-lg max-w-none">
          {children}
        </div>

        {/* Navegación entre páginas legales */}
        <div className="mt-16 pt-8 border-t-2 border-gold-200">
          <h3 className="text-lg font-bold text-navy-900 font-display mb-4">
            Otros documentos legales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/aviso-de-privacidad"
              className="flex items-center gap-3 p-4 bg-white border-2 border-navy-100 hover:border-gold-400 rounded-lg transition-all group"
            >
              <Shield className="w-5 h-5 text-navy-700 group-hover:text-gold-600" />
              <span className="text-sm font-medium text-navy-900">Aviso de Privacidad</span>
            </Link>
            <Link
              href="/terminos-y-condiciones"
              className="flex items-center gap-3 p-4 bg-white border-2 border-navy-100 hover:border-gold-400 rounded-lg transition-all group"
            >
              <Scale className="w-5 h-5 text-navy-700 group-hover:text-gold-600" />
              <span className="text-sm font-medium text-navy-900">Términos y Condiciones</span>
            </Link>
            <Link
              href="/politica-de-cookies"
              className="flex items-center gap-3 p-4 bg-white border-2 border-navy-100 hover:border-gold-400 rounded-lg transition-all group"
            >
              <Cookie className="w-5 h-5 text-navy-700 group-hover:text-gold-600" />
              <span className="text-sm font-medium text-navy-900">Política de Cookies</span>
            </Link>
            <Link
              href="/politica-de-reembolsos"
              className="flex items-center gap-3 p-4 bg-white border-2 border-navy-100 hover:border-gold-400 rounded-lg transition-all group"
            >
              <RefreshCw className="w-5 h-5 text-navy-700 group-hover:text-gold-600" />
              <span className="text-sm font-medium text-navy-900">Política de Reembolsos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer legal */}
      <footer className="bg-navy-900 text-navy-200 py-8 px-6 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} La Óptica Cerca de mí. Todos los derechos reservados.
          </p>
          <p className="text-xs text-navy-400 mt-2">
            Operado por Grupo Óptico ALPLA SA de CV
          </p>
        </div>
      </footer>
    </div>
  );
}