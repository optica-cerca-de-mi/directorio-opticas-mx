"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Check,
  Star,
  Award,
  Crown,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  MessageCircle,
  MapPin,
  Search,
  TrendingUp,
  Users,
  Smartphone,
  Clock,
  CreditCard,
  Sparkles,
  Bot,
  Zap,
  Globe,
  Brain,
  UserCog,
  Image as ImageIcon,
  FileText,
  Percent,
  HeadphonesIcon,
  AlertCircle,
  Megaphone,
  Info,
  Loader2,
} from "lucide-react";

// Componente reutilizable de espacio publicitario
function AdSpace({ size = "horizontal" }: { size?: "horizontal" | "square" }) {
  return (
    <div className="w-full flex justify-center my-8 md:my-12">
      <div
        className={`relative bg-gray-50 border border-dashed border-gray-300 rounded-[var(--radius-premium)] flex flex-col items-center justify-center ${
          size === "horizontal"
            ? "w-full max-w-4xl h-24 md:h-32"
            : "w-64 h-64 md:w-72 md:h-72"
        }`}
      >
        <div className="absolute top-2 right-3 flex items-center gap-1">
          <Megaphone className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
            Publicidad
          </span>
        </div>
        <p className="text-xs text-gray-400 font-medium">Google AdSense</p>
        <p className="text-[10px] text-gray-300 mt-1">Espacio publicitario</p>
      </div>
    </div>
  );
}

// Planes
const planes = [
  {
    id: "free",
    nombre: "Visibilidad Básica",
    tagline: "Perfecto para empezar",
    descripcion: "Aumenta la visibilidad de tu óptica apareciendo en el directorio.",
    precio: "0",
    periodo: "para siempre",
    icono: MapPin,
    color: "gray",
    cta: "Crear mi ficha gratis",
    beneficios: [
      "Presencia gratuita en el directorio",
      "Ficha con dirección y ubicación en mapa",
      "Clasificación Web (categoría SEO local)",
      "1 Foto de la óptica",
      "Supervisión manual de cada ficha",
      "Sello de Óptica Verificada (opcional)",
    ],
  },
  {
    id: "premium",
    nombre: "Presencia Digital Avanzada",
    tagline: "Más visibilidad y resultados",
    descripcion: "Convierte tu ficha en una minitienda profesional dentro del directorio.",
    precio: "199",
    periodo: "mensual",
    precioAnual: "1,990",
    descuentoAnual: "2 meses gratis",
    icono: Star,
    color: "navy",
    cta: "Contratar plan Avanzado",
    beneficios: [
      "Todo lo del plan Básico, más:",
      "Aparición destacada en las primeras páginas de tu zona",
      "Listado de servicios y horarios con estado 'Abierto/Cerrado'",
      "Enlaces directos a Web, WhatsApp, Instagram y Google Maps",
      "Mini web optimizada para SEO (hasta 600 palabras)",
      "Galería de fotos (hasta 8 imágenes)",
      "Optimización SEO avanzada de la ficha",
      "Hasta 3 modificaciones anuales incluidas",
      "Soporte prioritario",
    ],
  },
];

const planPremiumPlus = {
  id: "premium_plus",
  nombre: "Presencia Digital Premium+",
  tagline: "La experiencia completa. Máxima conversión.",
  descripcion: "Domina tu zona con herramientas de IA, agendamiento directo y posicionamiento máximo.",
  precio: "599",
  periodo: "mensual",
  precioAnual: "5,391",
  descuentoAnual: "3 meses gratis",
  icono: Crown,
  color: "gold",
  cta: "Contratar plan Premium+",
  beneficios: [
    "Todo lo del plan Avanzado, más:",
    "Posicionamiento #1 garantizado en búsquedas de tu zona",
    "Galería de hasta 10 fotos + Video promocional embebido",
    "Hasta 3 productos destacados con precios",
    "Cupones y promociones activas con contador",
    "Botón 'Agendar cita' integrado (Calendly/Google Calendar)",
    "Optimización y indexación prioritaria en Motores de Búsqueda con IA (SGE, Perplexity)",
    "Badge PREMIUM+ exclusivo con borde dorado",
    "Soporte VIP y gestor de cuenta dedicado",
    "Sin publicidad en tu ficha",
  ],
};

const beneficiosPrincipales = [
  {
    titulo: "Aparece cuando te buscan",
    subtitulo: "Captura clientes en el momento exacto de decisión",
    descripcion:
      "Cuando alguien busca 'óptica cerca de mí' o 'examen de la vista gratis en [tu ciudad]', tu ficha aparece con tu ubicación, horarios y servicios. No esperes a que te encuentren por casualidad: está presente donde tus futuros clientes ya están buscando.",
    icono: Search,
    color: "bg-navy-100 text-navy-700",
  },
  {
    titulo: "Domina las búsquedas locales",
    subtitulo: "Posiciónate primero en Google y motores con IA",
    descripcion:
      "Cada ficha en nuestro directorio genera una citación SEO que mejora tu posicionamiento en Google Maps y búsquedas tradicionales. Además, optimizamos tu contenido para que los nuevos buscadores con Inteligencia Artificial (como ChatGPT o Perplexity) recomienden tu óptica cuando pregunten '¿dónde hay una óptica con entrega en 1 hora?'",
    icono: Globe,
    color: "bg-navy-100 text-navy-700",
  },
  {
    titulo: "Empieza en 5 minutos",
    subtitulo: "Sin complicaciones técnicas, sin curva de aprendizaje",
    descripcion:
      "Nosotros nos encargamos de crear tu ficha profesional en menos de 48 horas. Tú solo llenas un formulario simple y nosotros hacemos el resto. Una vez publicada, puedes gestionar tu ficha desde tu panel de control cuando lo necesites.",
    icono: Brain,
    color: "bg-navy-100 text-navy-700",
  },
];

const polizaServicio = {
  titulo: "¿No tienes tiempo? Nosotros lo hacemos por ti",
  subtitulo: "Servicio de gestión de contenido",
  precio: "99",
  periodo: "al mes",
  descripcion:
    "Sabemos que administrar tu óptica ya te quita suficiente tiempo. Por eso ofrecemos un servicio opcional de gestión de contenido para que tú te enfoques en atender clientes mientras nosotros mantenemos tu ficha actualizada.",
  incluye: [
    { icono: FileText, texto: "Hasta 2 cambios de contenido al mes", detalle: "Actualiza textos, horarios, teléfono o dirección" },
    { icono: ImageIcon, texto: "Actualización de galería de fotos", detalle: "Hasta 3 fotos nuevas por mes (nosotros las optimizamos)" },
    { icono: Percent, texto: "Gestión de promociones y cupones", detalle: "Actualizamos tus ofertas vigentes y fechas de validez" },
    { icono: Search, texto: "Revisión y ajuste SEO mensual", detalle: "Optimizamos palabras clave y metadatos para mejor posicionamiento" },
    { icono: HeadphonesIcon, texto: "Soporte prioritario por WhatsApp", detalle: "Respuesta en menos de 4 horas en horario laboral" },
  ],
  noIncluye: [
    "Cambios de plan (ese es otro proceso)",
    "Rediseño completo de la ficha",
    "Más de 2 cambios al mes (se cotizan por separado)",
    "Cambios fuera de horario laboral (Lun-Vie 9:00-18:00)",
  ],
  nota: "Recuerda: Siempre puedes hacer tus propios cambios desde tu panel de control sin costo adicional. Esta póliza es opcional para quienes prefieren delegar esta tarea.",
};

const faqs = [
  {
    pregunta: "¿Cómo me encuentran los clientes en el directorio?",
    respuesta: "Los usuarios buscan por ciudad o zona, comparan varias opciones y eligen la óptica que mejor encaja. Tu ficha aparece con tu ubicación, horarios, servicios y reseñas, facilitando que te elijan.",
    icono: Search,
    color: "bg-blue-100 text-blue-700",
  },
  {
    pregunta: "¿Realmente consigo clientes nuevos?",
    respuesta: "Cuanta mejor sea tu presencia, más probabilidades tienes de destacar. Las ópticas Premium+ reciben hasta 5x más visitas que las gratuitas gracias al posicionamiento prioritario.",
    icono: TrendingUp,
    color: "bg-green-100 text-green-700",
  },
  {
    pregunta: "¿Qué significa que esté 'Impulsado por IA'?",
    respuesta: "Nuestra plataforma optimiza automáticamente el lenguaje de tu ficha para que los nuevos motores de búsqueda con Inteligencia Artificial (como Google SGE o Perplexity) recomienden tu óptica cuando un usuario haga preguntas complejas como '¿dónde hay una óptica con entrega en 1 hora cerca de mí?'.",
    icono: Bot,
    color: "bg-purple-100 text-purple-700",
  },
  {
    pregunta: "¿Puedo cambiar o cancelar mi plan?",
    respuesta: "Totalmente. No hay permanencia ni renovaciones automáticas sorpresa. Puedes cancelar la suscripción en cualquier momento o cambiar de plan cuando quieras.",
    icono: CalendarDays,
    color: "bg-pink-100 text-pink-700",
  },
  {
    pregunta: "¿Cómo me pagan los clientes?",
    respuesta: "Los clientes NO te pagan a través del directorio. Ellos te contactan por WhatsApp, teléfono o visitan tu óptica físicamente. El pago se hace directamente en tu establecimiento, como siempre.",
    icono: CreditCard,
    color: "bg-teal-100 text-teal-700",
  },
  {
    pregunta: "¿Qué pasa si necesito hacer cambios en mi ficha?",
    respuesta: "Tienes dos opciones: 1) Hacerlos tú mismo desde tu panel de control (sin costo adicional, disponible 24/7), o 2) Contratar nuestra póliza de gestión de contenido por $99/mes y nosotros hacemos hasta 2 cambios por ti cada mes.",
    icono: UserCog,
    color: "bg-orange-100 text-orange-700",
  },
];

const comoFunciona = [
  { paso: 1, titulo: "Búsqueda local o por IA", descripcion: "Los usuarios buscan 'óptica cerca de mí' o preguntan a su asistente de IA.", icono: Search },
  { paso: 2, titulo: "Comparan opciones", descripcion: "Ven tu ficha optimizada con fotos, reseñas, horarios y servicios destacados.", icono: Users },
  { paso: 3, titulo: "Te contactan directo", descripcion: "Hacen clic en WhatsApp, llaman por teléfono o agendan una cita en línea.", icono: Smartphone },
  { paso: 4, titulo: "Visitan tu óptica", descripcion: "Llegan a tu local listos para comprar o realizar su examen de la vista.", icono: MapPin },
];

export default function RegistroPage() {
  // 1. Obtener estado de autenticación
  const auth = useAuth() as any;
  const usuario = auth.usuario;
  const cargando = auth.cargando || auth.loading;
  const router = useRouter();

  // 2. Guardián: Si terminó de cargar y NO hay usuario, redirigir al login
  useEffect(() => {
    if (!cargando && !usuario) {
      router.push("/login?redirect=/registro");
    }
  }, [usuario, cargando, router]);

  // 3. Mostrar pantalla de carga mientras se verifica la sesión
  if (cargando || !usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-navy-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // 4. Si hay usuario, mostrar el contenido normal
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-navy-900 text-white py-16 md:py-20">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 badge-premium mb-6">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>El mejor Directorio de ópticas en México, impulsado por IA</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-display leading-tight">
              Haz crecer tu óptica con{" "}
              <span className="text-gold-400">visibilidad real</span>
            </h1>
            <p className="text-lg md:text-xl text-navy-100 max-w-2xl mx-auto">
              Más de 500,000 búsquedas de ópticas al mes. Registra tu negocio y llega a clientes que ya te están buscando, optimizado para motores de búsqueda tradicionales y con Inteligencia Artificial.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN: Así te encuentran los clientes */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-4 font-display">
              Así encuentran los clientes ópticas dentro del directorio
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Los usuarios buscan por ciudad o zona, comparan varias opciones y eligen 
              la óptica que mejor encaja con lo que necesitan.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
            {comoFunciona.map((item) => {
              const Icono = item.icono;
              return (
                <div key={item.paso} className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icono className="w-8 h-8 md:w-10 md:h-10 text-navy-700" />
                  </div>
                  <div className="text-xs md:text-sm font-bold text-gold-500 mb-2 uppercase tracking-wider">Paso {item.paso}</div>
                  <h3 className="font-bold text-navy-900 mb-2 text-base md:text-lg">{item.titulo}</h3>
                  <p className="text-sm text-gray-600">{item.descripcion}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 border-2 border-gray-200 rounded-[var(--radius-premium-lg)] p-6 md:p-8 max-w-4xl mx-auto">
            <p className="text-center text-sm text-gray-600 mb-4 font-medium flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-gold-500" />
              Ejemplo real dentro del buscador optimizado:
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar ópticas en tu ciudad..."
                  className="flex-1 bg-transparent focus:outline-none text-gray-400"
                  readOnly
                  value="Ópticas en Ciudad de México"
                />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`flex gap-3 p-3 border rounded-lg ${i === 1 ? 'border-gold-300 bg-gold-50/30' : 'border-gray-100'}`}>
                    <div className="w-16 h-16 bg-navy-100 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                        {i === 1 && (
                          <span className="badge-premium-plus text-[10px] px-2 py-0.5">PREMIUM+</span>
                        )}
                      </div>
                      <div className="h-2 bg-gray-100 rounded w-48 mb-2"></div>
                      <div className="flex gap-2">
                        <div className="h-2 bg-gray-100 rounded w-16"></div>
                        <div className="h-2 bg-gray-100 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              Cuanta mejor sea tu presencia dentro del buscador, más probabilidades 
              tienes de destacar frente a otras ópticas de tu zona.
            </p>
          </div>
        </div>
      </section>

      {/* ESPACIO PUBLICITARIO 1 */}
      <div className="bg-gray-50">
        <div className="container-premium">
          <AdSpace size="horizontal" />
        </div>
      </div>

      {/* SECCIÓN: Por qué estar en el directorio */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container-premium">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 badge-premium mb-4">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span>Ventajas exclusivas del directorio</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-4 font-display">
              Por qué las ópticas eligen estar aquí
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tres razones fundamentales que hacen de nuestro directorio la mejor inversión para tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {beneficiosPrincipales.map((item, i) => {
              const Icono = item.icono;
              return (
                <div key={i} className="card-premium p-8 relative group hover:border-navy-300 transition-all">
                  <div className="absolute top-4 right-4 text-6xl font-bold text-gray-100 font-display">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className={`w-14 h-14 ${item.color} rounded-[var(--radius-premium)] flex items-center justify-center mb-6 relative z-10`}>
                    <Icono className="w-7 h-7" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl md:text-2xl font-bold text-navy-900 mb-3 font-display">{item.titulo}</h3>
                    <p className="text-base font-semibold text-navy-700 mb-3">{item.subtitulo}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ESPACIO PUBLICITARIO 2 */}
      <div className="bg-gray-50">
        <div className="container-premium">
          <AdSpace size="horizontal" />
        </div>
      </div>

      {/* Planes */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container-premium">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-4 font-display">
              Elige el plan perfecto para tu óptica
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Puedes empezar con una ficha básica gratuita y posteriormente mejorar 
              tu presencia para destacar más dentro y fuera del buscador.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-6">
            {planes.map((plan) => {
              const Icono = plan.icono;
              return (
                <div key={plan.id} className={`card-premium p-8 relative flex flex-col ${plan.id === "premium" ? "border-2 border-navy-900" : ""}`}>
                  {plan.id === "premium" && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-navy-900 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Más visibilidad y resultados
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-[var(--radius-premium)] flex items-center justify-center ${plan.id === "premium" ? "bg-navy-900" : "bg-gray-100"}`}>
                        <Icono className={`w-6 h-6 ${plan.id === "premium" ? "text-white" : "text-gray-600"}`} />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-navy-900 font-display">{plan.nombre}</h3>
                        <p className="text-sm text-gray-500 font-medium">{plan.tagline}</p>
                      </div>
                    </div>
                    <p className="text-base text-gray-600 mb-4">{plan.descripcion}</p>
                    
                    <div className="flex flex-col mb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl md:text-5xl font-bold text-navy-900">${plan.precio}</span>
                        <span className="text-gray-500 text-base">/{plan.periodo}</span>
                      </div>
                      {plan.precioAnual && (
                        <div className="text-base text-navy-700 font-semibold mt-1">
                          o ${plan.precioAnual} al año <span className="text-green-600 font-bold">({plan.descuentoAnual})</span>
                        </div>
                      )}
                    </div>
                    {plan.id === "premium" && (
                      <p className="text-sm text-gray-500 mb-3 mt-2 font-medium">* Sin renovación automática</p>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-grow">
                    {plan.beneficios.map((beneficio, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-base">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 font-medium">{beneficio}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/registro/${plan.id}`}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-[var(--radius-premium)] font-bold text-base transition-all ${
                      plan.id === "premium"
                        ? "bg-navy-900 hover:bg-navy-800 text-white"
                        : "bg-white border-2 border-navy-900 text-navy-900 hover:bg-navy-50"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="card-premium p-8 md:p-10 relative flex flex-col md:flex-row gap-8 border-2 border-gold-400 shadow-[var(--shadow-premium-xl)] bg-gradient-to-br from-white to-gold-50/30">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500"></div>
              
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="badge-premium-plus whitespace-nowrap shadow-md">
                  <Crown className="w-3 h-3" />
                  Recomendado para máximo crecimiento
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gold-100 rounded-[var(--radius-premium)] flex items-center justify-center">
                    <planPremiumPlus.icono className="w-7 h-7 text-gold-700" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-navy-900 font-display">{planPremiumPlus.nombre}</h3>
                    <p className="text-base text-gray-600 font-medium">{planPremiumPlus.tagline}</p>
                  </div>
                </div>
                <p className="text-base text-gray-700 mb-6">{planPremiumPlus.descripcion}</p>
                
                <div className="flex flex-col mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-bold text-navy-900">${planPremiumPlus.precio}</span>
                    <span className="text-gray-500 text-base">/{planPremiumPlus.periodo}</span>
                  </div>
                  <div className="text-lg text-navy-700 font-bold mt-1">
                    o ${planPremiumPlus.precioAnual} al año <span className="text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded">({planPremiumPlus.descuentoAnual})</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 font-medium">* Sin renovación automática</p>
                </div>

                <Link
                  href={`/registro/${planPremiumPlus.id}`}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 rounded-[var(--radius-premium)] font-bold text-base transition-all bg-gold-500 hover:bg-gold-400 text-white shadow-lg"
                >
                  {planPremiumPlus.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 md:pl-8 pt-6 md:pt-0">
                <h4 className="font-bold text-navy-900 mb-4 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-500" />
                  Incluye todo lo anterior, más:
                </h4>
                <ul className="space-y-3">
                  {planPremiumPlus.beneficios.map((beneficio, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-base">
                      <Check className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-800 font-semibold">{beneficio}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-200">
        <div className="container-premium">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-4 font-display">
              Preguntas frecuentes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Resolvemos tus dudas para que tomes la mejor decisión.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {faqs.map((faq, i) => {
              const Icono = faq.icono;
              return (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-[var(--radius-premium)] p-6 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 ${faq.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icono className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-navy-900 mb-2 text-lg">{faq.pregunta}</h3>
                  <p className="text-base text-gray-600 leading-relaxed font-medium">{faq.respuesta}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-base text-gray-500 italic flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              *La información de la ficha, destaques y servicios dependen del plan contratado.
            </p>
          </div>
        </div>
      </section>

      {/* ESPACIO PUBLICITARIO 3 */}
      <div className="bg-gray-50">
        <div className="container-premium">
          <AdSpace size="horizontal" />
        </div>
      </div>

      {/* SECCIÓN: Póliza de servicio */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-premium">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-navy-100 text-navy-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <UserCog className="w-4 h-4" />
                Servicio opcional
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-4 font-display">
                {polizaServicio.titulo}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {polizaServicio.descripcion}
              </p>
            </div>

            <div className="card-premium p-8 md:p-10 border-2 border-navy-200 relative">
              <div className="absolute -top-4 right-8 bg-navy-900 text-white px-6 py-2 rounded-full shadow-lg">
                <span className="text-2xl font-bold">${polizaServicio.precio}</span>
                <span className="text-sm">/{polizaServicio.periodo}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-6 font-display flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Incluye:
                  </h3>
                  <ul className="space-y-4">
                    {polizaServicio.incluye.map((item, i) => {
                      const Icono = item.icono;
                      return (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icono className="w-5 h-5 text-navy-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-navy-900 text-base">{item.texto}</p>
                            <p className="text-sm text-gray-600">{item.detalle}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-navy-900 mb-6 font-display flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                    No incluye:
                  </h3>
                  <ul className="space-y-3 mb-8">
                    {polizaServicio.noIncluye.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-gray-400 font-bold">×</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-gold-50 border-l-4 border-gold-400 p-4 rounded-r-lg mt-auto">
                    <p className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                      <Info className="w-5 h-5 text-gold-700 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-navy-900">Importante:</strong> {polizaServicio.nota}
                      </span>
                    </p>
                  </div>

                  <Link
                    href="/registro/premium"
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-[var(--radius-premium)] font-bold text-base transition-all bg-navy-900 hover:bg-navy-800 text-white"
                  >
                    Agregar a mi plan
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 md:py-20 bg-navy-900 text-white">
        <div className="container-premium text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-display">
            ¿Listo para que más clientes te encuentren?
          </h2>
          <p className="text-lg md:text-xl text-navy-100 mb-8 max-w-2xl mx-auto">
            Únete hoy y comienza a recibir visitas de clientes potenciales en tu zona.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro/free" className="btn-secondary text-navy-900 bg-white border-0 text-base font-bold">
              Empezar gratis
            </Link>
            <Link href="/registro/premium_plus" className="btn-primary bg-gold-500 hover:bg-gold-400 text-white border-0 text-base font-bold">
              Ver plan Premium+
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}