"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────
// COMPONENTE INTERNO: Contiene la lógica con useSearchParams
// ─────────────────────────────────────────────────────────────────
function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  
  // ✅ NUEVO ESTADO PARA EL CONSENTIMIENTO LEGAL
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const redirect = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ✅ VALIDACIÓN: Si es registro, debe aceptar los términos
    if (modo === "registro" && !aceptaTerminos) {
      setError("Debes aceptar los Términos y Condiciones y el Aviso de Privacidad para crear una cuenta.");
      return; // Detiene la ejecución, no crea la cuenta
    }

    setCargando(true);

    try {
      if (modo === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: nombre });
        
        // ✅ Guardamos el consentimiento en la base de datos para auditoría legal
        await setDoc(doc(db, "usuarios", userCredential.user.uid), {
          email,
          nombre,
          fechaRegistro: new Date().toISOString(),
          aceptaTerminos: true,
          fechaAceptacionTerminos: new Date().toISOString(),
        });
      }
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || "Error en la autenticación");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <p className="text-gray-600">
            {modo === "login" 
              ? "Accede a tu panel de administración" 
              : "Registra tu óptica en el directorio"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
            <span className="font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === "registro" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all"
                  placeholder="Tu nombre"
                  required={modo === "registro"}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* ✅ CHECKBOX DE CONSENTIMIENTO LEGAL (Solo en modo registro) */}
          {modo === "registro" && (
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-1 w-4 h-4 text-navy-900 border-gray-300 rounded focus:ring-navy-500 focus:ring-2"
                />
                <span className="text-sm text-gray-600 leading-snug group-hover:text-gray-800 transition-colors">
                  He leído y acepto los{" "}
                  <a 
                    href="/terminos-y-condiciones" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-navy-700 underline hover:text-navy-900 font-medium"
                  >
                    Términos y Condiciones
                  </a>{" "}
                  y el{" "}
                  <a 
                    href="/aviso-de-privacidad" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-navy-700 underline hover:text-navy-900 font-medium"
                  >
                    Aviso de Privacidad
                  </a>
                  .
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {cargando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              modo === "login" ? "Iniciar sesión" : "Crear cuenta"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setModo(modo === "login" ? "registro" : "login");
              setError("");
              setAceptaTerminos(false); // Resetear el checkbox al cambiar de modo
            }}
            className="text-sm text-navy-700 hover:text-navy-900 font-medium hover:underline"
          >
            {modo === "login" 
              ? "¿No tienes cuenta? Regístrate" 
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-navy-900 flex items-center justify-center gap-2"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: Envuelve todo en Suspense
// ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Cargando...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}