"use client";

import { Database, Crown, MessageCircle, Phone, Home, TrendingUp, Users, Eye } from "lucide-react";
import Link from "next/link";

const modulos = [
  { href: "/admin/catalogos", titulo: "Catálogos", descripcion: "Estados, especialidades y seguros", icono: Database, color: "bg-blue-500", items: "3 colecciones" },
  { href: "/admin/planes", titulo: "Planes y precios", descripcion: "Gestiona los planes y sus precios", icono: Crown, color: "bg-gold-500", items: "3 planes activos" },
  { href: "/admin/faq", titulo: "FAQ", descripcion: "Preguntas frecuentes por categoría", icono: MessageCircle, color: "bg-green-500", items: "5 categorías, 11 preguntas" },
  { href: "/admin/soporte", titulo: "Soporte", descripcion: "Datos de contacto y horarios", icono: Phone, color: "bg-purple-500", items: "4 campos configurados" },
  { href: "/admin/home", titulo: "Home", descripcion: "Hero, badges y ópticas destacadas", icono: Home, color: "bg-pink-500", items: "3 secciones" },
];

const stats = [
  { label: "Colecciones config", valor: "8", icono: Database, cambio: "+1 esta semana" },
  { label: "Ópticas registradas", valor: "1", icono: Users, cambio: "En crecimiento" },
  { label: "Planes activos", valor: "3", icono: Crown, cambio: "Gratis, Premium, Premium+" },
  { label: "Vistas del sitio", valor: "—", icono: Eye, cambio: "Próximamente" },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 font-display mb-2">Panel de Super Administrador</h1>
        <p className="text-gray-600">Gestiona todo el contenido de La Óptica Cerca de mí desde un solo lugar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icono = stat.icono;
          return (
            <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                  <Icono className="w-5 h-5 text-navy-700" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-navy-900">{stat.valor}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.cambio}</p>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-xl font-bold text-navy-900 mb-4 font-display">Módulos de gestión</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulos.map((modulo) => {
            const Icono = modulo.icono;
            return (
              <Link key={modulo.href} href={modulo.href} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg hover:border-navy-300 transition-all group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${modulo.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icono className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-navy-900 mb-1">{modulo.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-2">{modulo.descripcion}</p>
                    <p className="text-xs text-navy-700 font-semibold">{modulo.items}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}