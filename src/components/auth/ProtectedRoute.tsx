"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUid?: string;
  requiredEmail?: string;
}

export default function ProtectedRoute({ children, requiredUid, requiredEmail }: ProtectedRouteProps) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  // Determina si el usuario autenticado es el dueño.
  // Prioridad: uid (identidad estable) sobre email (puede divergir por Stripe).
  const esDueño = (() => {
    if (!usuario) return false;
    if (requiredUid) return usuario.uid === requiredUid;
    if (requiredEmail) return usuario.email?.toLowerCase() === requiredEmail.toLowerCase();
    return true;
  })();

  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace("/login");
    } else if (!esDueño) {
      router.replace("/dashboard");
    }
  }, [usuario, cargando, esDueño, router]);

  // Mientras carga, no hay sesión o no es el dueño, mostramos un loader.
  // Nunca renderizamos los hijos antes de confirmar la autoría, para evitar el flash.
  if (cargando || !usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-navy-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!esDueño) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-navy-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}