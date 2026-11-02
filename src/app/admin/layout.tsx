"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Database,
  Crown,
  MessageCircle,
  Phone,
  Home,
  LogOut,
  Shield,
  Menu,
  X,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/catalogos", label: "Catálogos", icon: Database },
  { href: "/admin/planes", label: "Planes y precios", icon: Crown },
  { href: "/admin/publicidad", label: "Publicidad", icon: Megaphone }, // ✅ NUEVO
  { href: "/admin/faq", label: "FAQ", icon: MessageCircle },
  { href: "/admin/soporte", label: "Soporte", icon: Phone },
  { href: "/admin/home", label: "Home", icon: Home },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Obtenemos 'cargando' (o 'loading') del contexto de auth
  const auth = useAuth() as any;
  const usuario = auth.usuario;
  const cerrarSesion = auth.cerrarSesion;
  const authCargando = auth.cargando || auth.loading; // Soporta ambos nombres

  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Si el contexto de auth aún está cargando, NO hacemos NADA.
    if (authCargando) {
      console.log("⏳ Esperando a que Firebase verifique la sesión...");
      return;
    }

    // 2. Si YA terminó de cargar y NO hay usuario, entonces sí redirigimos.
    if (!usuario) {
      console.log("⚠️ Sesión verificada: No hay usuario. Redirigiendo a login...");
      router.push("/login");
      return;
    }

    // 3. Si hay usuario, mostramos el panel.
    console.log("✅ Usuario detectado, mostrando admin:", usuario.email);
    setCargando(false);
  }, [usuario, authCargando, router]);

  const handleLogout = async () => {
    await cerrarSesion();
    router.push("/login");
  };

  // Pantalla de carga mientras Firebase verifica la sesión
  if (cargando || authCargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-navy-800">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-navy-900" />
              </div>
              <div>
                <p className="font-display font-bold text-sm">Super Admin</p>
                <p className="text-[10px] text-gray-400">Panel de control</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icono = item.icon;
            const activo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activo ? "bg-gold-500 text-navy-900" : "text-gray-300 hover:bg-navy-800 hover:text-white"}`}
              >
                <Icono className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-800">
          <div className="mb-3 px-4">
            <p className="text-xs text-gray-400">Sesión activa</p>
            <p className="text-sm text-white truncate">{usuario?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-900/50 hover:text-red-400 transition-colors cursor-pointer w-full text-left">
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-navy-900" />
            <span className="font-bold text-navy-900">Super Admin</span>
          </div>
          <div className="w-6"></div>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}