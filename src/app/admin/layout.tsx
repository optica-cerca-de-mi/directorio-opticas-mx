"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context"; // Asegúrate de que la ruta sea correcta
import { esSuperAdmin } from "@/lib/roles";
import { Loader2, LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;

    if (!usuario) {
      router.push("/login?redirect=/admin");
    } else if (!esSuperAdmin(usuario.email)) {
      // Si está logueado pero no es super admin, lo expulsamos al dashboard normal
      router.push("/dashboard");
    }
  }, [usuario, cargando, router]);

  if (cargando || !usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-navy-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  if (!esSuperAdmin(usuario.email)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-navy-900 mb-2">Acceso denegado</h2>
          <p className="text-gray-600 mb-6">No tienes permisos de super administrador para ver esta página.</p>
          <Link href="/dashboard" className="btn-primary">
            Volver a mi panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple del admin */}
      <header className="bg-navy-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/admin" className="font-display text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-gold-400" />
            Super Administrador
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">{usuario.email}</span>
            <button
              onClick={() => {
                // Aquí iría tu función de cerrar sesión, ej: auth.signOut()
                router.push("/login");
              }}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}