"use client";

import Link from "next/link";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import { AdSlot } from "@/components/OptiAdBoost";

export default function FooterPublico() {
  return (
    <footer className="bg-navy-900 text-gray-300 mt-auto">
      {/* ✅ OptiAdBoost: Banner discreto en footer global */}
      <AdSlot slotId="footer-global" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna 1: Marca */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold text-white font-display mb-4">
              La Óptica Cerca de mí
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              El directorio #1 de ópticas en México. Encuentra la mejor opción cerca de ti con reseñas reales y horarios en vivo.
            </p>
            <div className="flex items-center gap-2 text-sm text-gold-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Plataforma verificada y segura</span>
            </div>
          </div>

          {/* Columna 2: Explorar */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explorar</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/opticas" className="hover:text-gold-400 transition-colors">Directorio de ópticas</Link></li>
              <li><Link href="/estados" className="hover:text-gold-400 transition-colors">Buscar por estado</Link></li>
              <li><Link href="/planes" className="hover:text-gold-400 transition-colors">Planes y precios</Link></li>
              <li><Link href="/registro" className="hover:text-gold-400 transition-colors">Registra tu óptica</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terminos-y-condiciones" className="hover:text-gold-400 transition-colors">Términos y condiciones</Link></li>
              <li><Link href="/aviso-de-privacidad" className="hover:text-gold-400 transition-colors">Aviso de privacidad</Link></li>
              <li><Link href="/politica-de-cookies" className="hover:text-gold-400 transition-colors">Política de cookies</Link></li>
              <li><Link href="/politica-de-reembolsos" className="hover:text-gold-400 transition-colors">Política de reembolsos</Link></li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400" />
                <span>contacto@optica-cerca-de-mi.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400" />
                <span>Soporte para ópticas</span>
              </li>
              {/* Redes sociales - Sin iconos por ahora */}
              <li className="flex gap-4 mt-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  Facebook
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} La Óptica Cerca de mí. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}