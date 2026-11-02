import Link from "next/link";
import { Check, Crown, Star, Store, ArrowRight, Shield, Zap, Headphones } from "lucide-react";

export const metadata = {
  title: "Planes y Precios | La Óptica Cerca de mí",
  description: "Elige el plan perfecto para tu óptica. Desde gratis hasta Premium+ con todas las herramientas para atraer más clientes.",
};

const PLANES = [
  {
    id: "free",
    nombre: "Visibilidad Básica",
    precio: "0",
    periodo: "para siempre",
    descripcion: "Ideal para ópticas que inician y quieren presencia digital básica.",
    icono: Store,
    color: "gray",
    beneficios: [
      "Presencia en el directorio nacional",
      "Ficha básica con ubicación",
      "Hasta 3 fotos de la óptica",
      "Horarios de atención",
      "Información de contacto",
      "Soporte por email",
    ],
    limitaciones: [
      "Sin logo personalizado",
      "Sin galería ampliada",
      "Sin productos destacados",
      "Con publicidad en tu ficha",
    ],
    cta: "Comenzar gratis",
    destacado: false,
  },
  {
    id: "premium",
    nombre: "Presencia Digital",
    precio: "199",
    periodo: "mensual",
    descripcion: "Para ópticas que quieren destacar y atraer más clientes.",
    icono: Star,
    color: "navy",
    beneficios: [
      "Todo lo del plan Básico",
      "Logo personalizado",
      "Galería de hasta 8 fotos",
      "Descripción personalizada",
      "Productos destacados (hasta 3)",
      "Enlaces a redes sociales",
      "Botones de Google Maps y Waze",
      "Sin publicidad en tu ficha",
      "Optimización SEO",
      "Soporte prioritario",
    ],
    limitaciones: [
      "Sin hero personalizable",
      "Sin contenido enriquecido",
      "Sin video promocional",
      "Sin promociones activas",
    ],
    cta: "Elegir Premium",
    destacado: true,
    badge: "Más popular",
  },
  {
    id: "premium_plus",
    nombre: "Premium+",
    precio: "599",
    periodo: "mensual",
    descripcion: "La experiencia completa para ópticas que quieren liderar su mercado.",
    icono: Crown,
    color: "gold",
    beneficios: [
      "Todo lo del plan Premium",
      "Hero personalizable con imagen",
      "Contenido enriquecido (bloques modulares)",
      "Video promocional embebido",
      "Promociones y ofertas activas",
      "Galería de hasta 15 fotos",
      "Reseñas de Google visibles",
      "Posicionamiento #1 en búsquedas",
      "Sin publicidad de terceros",
      "Soporte VIP 24/7",
      "Reportes de rendimiento",
      "Asesoría de marketing",
    ],
    limitaciones: [],
    cta: "Elegir Premium+",
    destacado: false,
  },
];

const COMPARATIVA = [
  { caracteristica: "Presencia en directorio", free: true, premium: true, premiumPlus: true },
  { caracteristica: "Fotos en galería", free: "3", premium: "8", premiumPlus: "15" },
  { caracteristica: "Logo personalizado", free: false, premium: true, premiumPlus: true },
  { caracteristica: "Descripción personalizada", free: false, premium: true, premiumPlus: true },
  { caracteristica: "Productos destacados", free: false, premium: "3", premiumPlus: "3" },
  { caracteristica: "Redes sociales", free: false, premium: true, premiumPlus: true },
  { caracteristica: "Google Maps y Waze", free: false, premium: true, premiumPlus: true },
  { caracteristica: "Hero personalizable", free: false, premium: false, premiumPlus: true },
  { caracteristica: "Contenido enriquecido", free: false, premium: false, premiumPlus: true },
  { caracteristica: "Video promocional", free: false, premium: false, premiumPlus: true },
  { caracteristica: "Promociones activas", free: false, premium: false, premiumPlus: true },
  { caracteristica: "Reseñas de Google", free: false, premium: false, premiumPlus: true },
  { caracteristica: "Posicionamiento #1", free: false, premium: false, premiumPlus: true },
  { caracteristica: "Sin publicidad", free: false, premium: true, premiumPlus: true },
  { caracteristica: "Soporte", free: "Email", premium: "Prioritario", premiumPlus: "VIP 24/7" },
];

export default function PlanesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Elige el plan perfecto para tu óptica
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Desde presencia básica hasta experiencia premium. Todos los planes incluyen 
            acceso al directorio #1 de ópticas en México.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gold-400" />
              <span>Sin contratos</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-gold-400" />
              <span>Cancela cuando quieras</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-gold-400" />
              <span>Soporte incluido</span>
            </div>
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANES.map((plan) => {
              const Icono = plan.icono;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border-2 p-8 transition-all hover:shadow-xl ${
                    plan.destacado
                      ? "border-navy-900 shadow-lg"
                      : plan.color === "gold"
                      ? "border-gold-400"
                      : "border-gray-200"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-navy-900 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                        plan.color === "gold"
                          ? "bg-gold-100"
                          : plan.color === "navy"
                          ? "bg-navy-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <Icono
                        className={`w-8 h-8 ${
                          plan.color === "gold"
                            ? "text-gold-600"
                            : plan.color === "navy"
                            ? "text-navy-700"
                            : "text-gray-600"
                        }`}
                      />
                    </div>

                    <h3 className="text-2xl font-bold text-navy-900 font-display mb-2">
                      {plan.nombre}
                    </h3>

                    <div className="mb-3">
                      <span className="text-4xl font-bold text-navy-900">${plan.precio}</span>
                      <span className="text-gray-600">/{plan.periodo}</span>
                    </div>

                    <p className="text-sm text-gray-600">{plan.descripcion}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.beneficios.map((beneficio, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{beneficio}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitaciones.length > 0 && (
                    <div className="space-y-2 mb-6 pt-6 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase">No incluye:</p>
                      {plan.limitaciones.map((lim, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-gray-400 text-sm">—</span>
                          <span className="text-sm text-gray-500">{lim}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/login?redirect=/registro/${plan.id}`}
                    className={`w-full py-3 rounded-lg font-semibold text-center transition-all flex items-center justify-center gap-2 ${
                      plan.destacado
                        ? "bg-navy-900 hover:bg-navy-800 text-white shadow-lg"
                        : plan.color === "gold"
                        ? "bg-gold-500 hover:bg-gold-400 text-navy-900"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tabla comparativa */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy-900 font-display text-center mb-8">
            Comparativa de planes
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                    Característica
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">
                    Gratis
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-navy-900 bg-navy-50">
                    Premium
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gold-700 bg-gold-50">
                    Premium+
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIVA.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-700">{item.caracteristica}</td>
                    <td className="py-3 px-4 text-center">
                      {typeof item.free === "boolean" ? (
                        item.free ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : (
                        <span className="text-sm font-medium text-gray-700">{item.free}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center bg-navy-50/30">
                      {typeof item.premium === "boolean" ? (
                        item.premium ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : (
                        <span className="text-sm font-medium text-navy-900">{item.premium}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center bg-gold-50/30">
                      {typeof item.premiumPlus === "boolean" ? (
                        item.premiumPlus ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : (
                        <span className="text-sm font-medium text-gold-700">{item.premiumPlus}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy-900 font-display text-center mb-8">
            Preguntas frecuentes
          </h2>

          <div className="space-y-4">
            {[
              {
                pregunta: "¿Puedo cambiar de plan en cualquier momento?",
                respuesta:
                  "Sí, puedes mejorar o reducir tu plan cuando quieras. Los cambios se aplican inmediatamente y se ajustan en tu próxima facturación.",
              },
              {
                pregunta: "¿Hay contrato de permanencia?",
                respuesta:
                  "No, todos nuestros planes son mensuales sin contrato. Puedes cancelar cuando quieras sin penalizaciones.",
              },
              {
                pregunta: "¿Qué métodos de pago aceptan?",
                respuesta:
                  "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), así como transferencias bancarias para planes anuales.",
              },
              {
                pregunta: "¿Puedo probar Premium antes de pagar?",
                respuesta:
                  "Sí, ofrecemos 7 días de prueba gratuita para los planes Premium y Premium+. No se requiere tarjeta de crédito para iniciar la prueba.",
              },
              {
                pregunta: "¿Qué pasa con mis datos si cancelo?",
                respuesta:
                  "Tus datos se mantienen en nuestro sistema por 30 días después de la cancelación. Si decides volver, todo estará como lo dejaste.",
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-navy-900 mb-2">{faq.pregunta}</h3>
                <p className="text-sm text-gray-600">{faq.respuesta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display mb-4">
            ¿Listo para hacer crecer tu óptica?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Únete a cientos de ópticas que ya están atrayendo más clientes con nuestro directorio.
          </p>
          <Link
            href="/login?redirect=/registro/free"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-lg transition-all shadow-lg text-lg"
          >
            Comenzar ahora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}