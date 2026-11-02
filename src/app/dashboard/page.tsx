"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Store, Plus, Crown, Star, Eye, Edit3, MapPin } from "lucide-react";
import Link from "next/link";

interface OpticaResumen {
  id: string;
  nombreComercial: string;
  ciudad?: string;
  estado?: string;
  plan?: string;
  fechaCreacion?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth() as any;
  const usuario = auth.usuario;
  const cargando = auth.cargando || auth.loading;

  const [opticas, setOpticas] = useState<OpticaResumen[]>([]);
  const [loadingOpticas, setLoadingOpticas] = useState(true);

  useEffect(() => {
    if (!cargando && !usuario) {
      router.push("/login?redirect=/dashboard");
    }
  }, [usuario, cargando, router]);

  useEffect(() => {
    const cargarOpticas = async () => {
      if (!usuario) return;
      
      try {
        const q = query(
          collection(db, "opticas"),
          where("uid", "==", usuario.uid)
        );
        const snapshot = await getDocs(q);
        const opticasData: OpticaResumen[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          opticasData.push({
            id: doc.id,
            nombreComercial: data.nombreComercial || "Sin nombre",
            ciudad: data.ciudad,
            estado: data.estado,
            plan: data.plan || "free",
            fechaCreacion: data.fechaCreacion,
          });
        });

        setOpticas(opticasData);

        // Si solo tiene una óptica, redirigir automáticamente
        if (opticasData.length === 1) {
          router.push(`/dashboard/${opticasData[0].id}`);
        }
      } catch (error) {
        console.error("Error al cargar ópticas:", error);
      } finally {
        setLoadingOpticas(false);
      }
    };

    cargarOpticas();
  }, [usuario, router]);

  if (cargando || loadingOpticas) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-navy-700 animate-spin" />
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 font-display mb-2">
            ¡Hola, {usuario.displayName || usuario.email}! 👋
          </h1>
          <p className="text-gray-600">
            {opticas.length === 0 
              ? "Aún no tienes ópticas registradas"
              : `Tienes ${opticas.length} óptica${opticas.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {opticas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opticas.map((optica) => {
              const planColor = optica.plan === "premium_plus" 
                ? "bg-gradient-to-r from-amber-500 to-amber-600" 
                : optica.plan === "premium" 
                ? "bg-navy-900" 
                : "bg-gray-400";
              
              const planLabel = optica.plan === "premium_plus" 
                ? "PREMIUM+" 
                : optica.plan === "premium" 
                ? "PREMIUM" 
                : "FREE";

              return (
                <Link
                  key={optica.id}
                  href={`/dashboard/${optica.id}`}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className={`${planColor} px-4 py-2 text-white text-xs font-bold`}>
                    {planLabel}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy-900 mb-2 font-display">
                      {optica.nombreComercial}
                    </h3>
                    {optica.ciudad && optica.estado && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {optica.ciudad}, {optica.estado}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}

            <Link
              href="/crear-optica"
              className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:border-navy-500 hover:bg-navy-50 transition-all min-h-[200px]"
            >
              <Plus className="w-12 h-12 text-gray-400 mb-2" />
              <h3 className="text-lg font-bold text-navy-900">Agregar óptica</h3>
              <p className="text-sm text-gray-600">¿Tienes otra sucursal?</p>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-navy-900 mb-2 font-display">
              ¡Crea tu primera óptica!
            </h2>
            <p className="text-gray-600 mb-6">
              Completa la información básica y comienza a personalizar tu ficha.
            </p>
            <Link
              href="/crear-optica"
              className="inline-flex items-center gap-2 px-8 py-4 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear mi primera óptica
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}