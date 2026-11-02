"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Eye,
  Loader2,
  Sparkles,
  Crown,
  ArrowRight,
  Palette,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const opticaId = params.opticaId as string;
  const [optica, setOptica] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const { cerrarSesion, usuario } = useAuth();

  useEffect(() => {
    const cargarOptica = async () => {
      try {
        const docRef = doc(db, "opticas", opticaId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOptica({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No se encontró la óptica");
        }
      } catch (error) {
        console.error("Error al cargar la óptica:", error);
      } finally {
        setCargando(false);
      }
    };

    if (opticaId) {
      cargarOptica();
    }
  }, [opticaId]);

  // Badge del plan con colores según tipo
  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "premium_plus":
        return {
          label: "Premium+",
          bg: "bg-gradient-to-r from-amber-400 to-amber-600",
          text: "text-white",
          icon: Crown,
        };
      case "premium":
        return {
          label: "Premium",
          bg: "bg-gradient-to-r from-navy-700 to-navy-900",
          text: "text-white",
          icon: ShieldCheck,
        };
      default:
        return {
          label: "Gratis",
          bg: "bg-gray-200",
          text: "text-gray-700",
          icon: Star,
        };
    }
  };

  const menuItems = [
    {
      href: `/dashboard/${opticaId}/disenar-ficha`,
      label: "Diseña tu Ficha",
      icon: Palette,
      destacado: true,
    },
    { href: `/dashboard/${opticaId}`, label: "Resumen", icon: LayoutDashboard },
    { href: `/dashboard/${opticaId}/info`, label: "Información", icon: FileText },
    { href: `/dashboard/${opticaId}/galeria`, label: "Galería", icon: ImageIcon },
    { href: `/dashboard/${opticaId}/plan`, label: "Plan y facturación", icon: CreditCard },
    { href: `/dashboard/${opticaId}/configuracion`, label: "Configuración", icon: Settings },
    { href: "/ayuda", label: "Ayuda", icon: HelpCircle },
  ];

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-navy-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu óptica...</p>
        </div>
      </div>
    );
  }

  if (!optica) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No se encontró la óptica</p>
          <Link href="/registro" className="btn-primary">
            Registrar una óptica
          </Link>
        </div>
      </div>
    );
  }

  const planBadge = getPlanBadge(optica.plan || "free");
  const PlanIcon = planBadge.icon;

  return (
    <ProtectedRoute requiredEmail={optica.email}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full overflow-y-auto">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-navy-900">
                La Óptica Cerca de mí
              </span>
            </Link>
          </div>

          {/* Info de la óptica y plan */}
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <p className="text-xs text-gray-500 mb-1 font-medium">Óptica actual</p>
            <h3 className="font-bold text-navy-900 text-sm truncate mb-2">
              {optica.nombre || "Mi Óptica"}
            </h3>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${planBadge.bg} ${planBadge.text}`}>
              <PlanIcon className="w-3 h-3" />
              {planBadge.label}
            </div>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icono = item.icon;
              const esDisenarFicha = item.destacado;

              if (esDisenarFicha) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-navy-900 to-navy-700 text-white font-semibold text-sm shadow-lg shadow-navy-900/20 hover:shadow-xl hover:shadow-navy-900/30 hover:from-navy-800 hover:to-navy-600 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-navy-50 hover:text-navy-700 transition-colors"
                >
                  <Icono className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Banner de Upgrade (solo para plan Gratis) */}
          {optica.plan === "free" && (
            <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-amber-50 via-amber-50 to-gold-50 border-2 border-amber-200 rounded-xl relative overflow-hidden">
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/30 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gold-200/20 rounded-full translate-y-8 -translate-x-8"></div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900">Desbloquea más</p>
                    <p className="text-[10px] text-amber-700">Mejora tu plan</p>
                  </div>
                </div>

                <ul className="space-y-1.5 mb-3">
                  <li className="flex items-start gap-1.5 text-[11px] text-amber-900">
                    <Zap className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Galería de hasta 15 fotos</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-[11px] text-amber-900">
                    <Zap className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Reseñas de Google visibles</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-[11px] text-amber-900">
                    <Zap className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Botones WhatsApp y Waze</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-[11px] text-amber-900">
                    <Zap className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Mayor visibilidad en el ranking</span>
                  </li>
                </ul>

                <Link
                  href={`/dashboard/${opticaId}/plan`}
                  className="block w-full text-center px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Ver planes desde $199/mes
                </Link>
              </div>
            </div>
          )}

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={async () => {
                await cerrarSesion();
                window.location.href = "/login";
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 ml-64">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}