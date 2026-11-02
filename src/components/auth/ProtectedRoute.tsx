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
        // No hay usuario logueado, redirigir al login
        router.push("/login");
      } else if (requiredEmail && usuario.email !== requiredEmail) {
        // El usuario no es el dueño de esta óptica
        router.push("/dashboard");
      }
    }
  }, [usuario, cargando, router, requiredEmail]);

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

  return <>{children}</>;
}