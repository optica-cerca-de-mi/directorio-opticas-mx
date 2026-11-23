"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredEmail?: string;
}

export default function ProtectedRoute({ children, requiredEmail }: ProtectedRouteProps) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando) {
      if (!usuario) {
        router.replace("/login");
      } else if (requiredEmail && usuario.email?.toLowerCase() !== requiredEmail.toLowerCase()) {
        router.replace("/dashboard");
      }
    }
  }, [usuario, cargando, router, requiredEmail]);

  // 1. Mientras carga o no hay usuario, mostramos el loader.
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

  // 2. Si hay un email requerido y no coincide, también mostramos loader mientras redirige.
  // Esto evita el "flash" del contenido del dashboard antes de la expulsión.
  if (requiredEmail && usuario.email?.toLowerCase() !== requiredEmail.toLowerCase()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-navy-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // 3. Si todo está correcto, renderizamos el contenido.
  return <>{children}</>;
}