"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Check, Star, Award, Crown, ArrowRight, ShieldCheck, CalendarDays,
  MessageCircle, MapPin, Search, TrendingUp, Users, Smartphone, Clock,
  CreditCard, Sparkles, Bot, Zap, Globe, Brain, UserCog, Image as ImageIcon,
  FileText, Percent, HeadphonesIcon, AlertCircle, Megaphone, Info, Loader2, Store
} from "lucide-react";

function AdSpace({ size = "horizontal" }: { size?: "horizontal" | "square" }) {
  return (
    <div className="w-full flex justify-center my-8 md:my-12 px-4">
      <div className={`relative bg-gray-50 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center w-full ${size === "horizontal" ? "max-w-4xl h-24 md:h-32" : "max-w-xs h-64"}`}>
        <div className="absolute top-2 right-3 flex items-center gap-1">
          <Megaphone className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Publicidad</span>
        </div>
        <p className="text-xs text-gray-400 font-medium">Espacio publicitario</p>
      </div>
    </div>
  );
}

const planes = [
  {
    id: "free", nombre: "Visibilidad Básica", tagline: "Perfecto para empezar",
    descripcion: "Aumenta la visibilidad de tu óptica apareciendo en el directorio.",
    precio: "0", periodo: "para siempre", icono: MapPin, color: "gray", cta: "Crear mi ficha gratis",
    beneficios: ["Presencia gratuita en el directorio", "Ficha con dirección y ubicación en mapa", "1 Foto de la óptica", "Supervisión manual de cada ficha"],
  },
  {
    id: "premium", nombre: "Presencia Digital", tagline: "Más visibilidad y resultados",
    descripcion: "Convierte tu ficha en una minitienda profesional dentro del directorio.",
    precio: "199", periodo: "mensual", precioAnual: "1,990", descuentoAnual: "2 meses gratis",
    icono: Star, color: "navy", cta: "Contratar plan Digital",
    beneficios: ["Todo lo del plan Básico, más:", "Aparición destacada en las primeras páginas", "Galería de fotos (hasta 8 imágenes)", "Enlaces directos a Web, WhatsApp y Maps", "Hasta 3 modificaciones anuales incluidas"],
  },
];

const planPremiumPlus = {
  id: "premium_plus", nombre: "Presencia Digital Premium+", tagline: "La experiencia completa",
  descripcion: "Domina tu zona con herramientas de IA, agendamiento directo y posicionamiento máximo.",
  precio: "599", periodo: "mensual", precioAnual: "5,391", descuentoAnual: "3 meses gratis",
  icono: Crown, color: "gold", cta: "Contratar plan Premium+",
  beneficios: ["Todo lo del plan Digital, más:", "Posicionamiento #1 garantizado en tu zona", "Galería de hasta 15 fotos + Video promocional", "Cupones y promociones activas con contador", "Sin publicidad en tu ficha", "Soporte VIP y gestor de cuenta dedicado"],
};

export default function RegistroPage() {
  const auth = useAuth() as any;
  const usuario = auth.usuario;
  const cargando = auth.cargando || auth.loading;
  const router = useRouter();

  useEffect(() => {
    if (!cargando && usuario) {
      router.push("/dashboard");
    }
  }, [usuario, cargando, router]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-navy-700 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-navy-900 text-white py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-navy-800 text-gold-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>El mejor Directorio de ópticas en México</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 font-display leading-tight">
            Haz crecer tu óptica con <span className="text-gold-400">visibilidad real</span>
          </h1>
          <p className="text-lg text-navy-100 max-w-2xl mx-auto">
            Registra tu negocio y llega a clientes que ya te están buscando. Elige el plan que mejor se adapte a tu etapa de crecimiento.
          </p>
        </div>
      </section>

      {/* SECCIÓN MULTI-SUCURSALES (NUEVA) */}
      <section className="py-10 bg-gold-50 border-b border-gold-200 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-gold-300 text-navy-900 px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-sm">
            <Store className="w-4 h-4 text-gold-600" />
            <span>¿Tienes más de una sucursal?</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-4 font-display">
            Políticas de Multi-Sucursales y Planes Corporativos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Plan Free</p>
              <p className="text-2xl font-bold text-navy-900">1</p>
              <p className="text-xs text-gray-600">Sucursal máxima</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-navy-200 shadow-sm">
              <p className="text-xs text-navy-500 uppercase font-bold mb-1">Plan Premium</p>
              <p className="text-2xl font-bold text-navy-900">3</p>
              <p className="text-xs text-gray-600">Sucursales máximas</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gold-300 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gold-400 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">POPULAR</div>
              <p className="text-xs text-gold-600 uppercase font-bold mb-1">Plan Premium+</p>
              <p className="text-2xl font-bold text-navy-900">3</p>
              <p className="text-xs text-gray-600">Sucursales máximas</p>
            </div>
            <div className="bg-navy-900 p-4 rounded-xl border border-navy-800 shadow-sm text-white">
              <p className="text-xs text-gold-400 uppercase font-bold mb-1">Corporativo</p>
              <p className="text-2xl font-bold">4+</p>
              <p className="text-xs text-navy-200">Tarifas preferenciales</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto bg-white p-4 rounded-lg border border-gray-200">
            <Info className="w-4 h-4 inline mr-1 text-navy-700" />
            <strong>Nota importante:</strong> Para agregar una segunda sucursal siendo usuario Free, deberás actualizar a un plan Premium. Los planes corporativos (4+ sucursales) incluyen facturación consolidada, descuentos por volumen y un gestor de cuenta dedicado.
          </p>
        </div>
      </section>

      {/* Planes */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4 font-display">
              Elige el plan perfecto para tu óptica
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Puedes empezar con una ficha básica gratuita y posteriormente mejorar tu presencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {planes.map((plan) => {
              const Icono = plan.icono;
              return (
                <div key={plan.id} className={`bg-white rounded-2xl p-6 md:p-8 relative flex flex-col border ${plan.id === "premium" ? "border-2 border-navy-900 shadow-lg" : "border-gray-200"}`}>
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.id === "premium" ? "bg-navy-900" : "bg-gray-100"}`}>
                        <Icono className={`w-6 h-6 ${plan.id === "premium" ? "text-white" : "text-gray-600"}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-navy-900 font-display">{plan.nombre}</h3>
                        <p className="text-sm text-gray-500 font-medium">{plan.tagline}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{plan.descripcion}</p>
                    <div className="flex flex-col mb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-navy-900">${plan.precio}</span>
                        <span className="text-gray-500 text-base">/{plan.periodo}</span>
                      </div>
                      {plan.precioAnual && (
                        <div className="text-sm text-navy-700 font-semibold mt-1">
                          o ${plan.precioAnual} al año <span className="text-green-600 font-bold">({plan.descuentoAnual})</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.beneficios.map((beneficio, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm md:text-base">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/registro/${plan.id}`} className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-base transition-all bg-navy-900 hover:bg-navy-800 text-white">
                    {plan.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Premium+ Card */}
          <div className="bg-gradient-to-br from-white to-gold-50/50 rounded-2xl p-6 md:p-8 border-2 border-gold-400 shadow-xl relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-gold-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                <Crown className="w-3 h-3" /> Recomendado para máximo crecimiento
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gold-100 rounded-xl flex items-center justify-center">
                    <planPremiumPlus.icono className="w-7 h-7 text-gold-700" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-navy-900 font-display">{planPremiumPlus.nombre}</h3>
                    <p className="text-sm text-gray-600 font-medium">{planPremiumPlus.tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-6">{planPremiumPlus.descripcion}</p>
                <div className="flex flex-col mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-navy-900">${planPremiumPlus.precio}</span>
                    <span className="text-gray-500 text-base">/{planPremiumPlus.periodo}</span>
                  </div>
                  <div className="text-base text-navy-700 font-bold mt-1">
                    o ${planPremiumPlus.precioAnual} al año <span className="text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded">({planPremiumPlus.descuentoAnual})</span>
                  </div>
                </div>
                <Link href={`/registro/${planPremiumPlus.id}`} className="w-full md:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 rounded-xl font-bold text-base transition-all bg-gold-500 hover:bg-gold-400 text-white shadow-lg">
                  {planPremiumPlus.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 md:pl-8 pt-6 md:pt-0">
                <h4 className="font-bold text-navy-900 mb-4 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-500" /> Incluye todo lo anterior, más:
                </h4>
                <ul className="space-y-3">
                  {planPremiumPlus.beneficios.map((beneficio, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm md:text-base">
                      <Check className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-800 font-medium">{beneficio}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-navy-900 text-white px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            ¿Listo para que más clientes te encuentren?
          </h2>
          <p className="text-lg text-navy-100 mb-8 max-w-2xl mx-auto">
            Únete hoy y comienza a recibir visitas de clientes potenciales en tu zona.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro/free" className="px-8 py-3 bg-white text-navy-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
              Empezar gratis
            </Link>
            <Link href="/registro/premium_plus" className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-white font-bold rounded-xl transition-colors">
              Ver plan Premium+
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}