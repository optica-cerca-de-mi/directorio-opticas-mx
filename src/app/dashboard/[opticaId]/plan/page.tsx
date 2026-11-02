"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Crown,
  Star,
  Check,
  X,
  CreditCard,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowUpRight,
  Shield,
  Clock,
  MapPin,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Award,
  TrendingUp,
  FileText,
  Eye,
} from "lucide-react";

const planes = [
  {
    id: "free",
    nombre: "Gratuito",
    precio: 0,
    descripcion: "Para ópticas que inician",
    caracteristicas: {
      fotos: 3,
      video: false,
      badgeVerificado: false,
      estadisticas: false,
      whatsapp: false,
      gestionContenido: false,
      accesoB2B: false,
      soporte: "Email",
      fichaPublica: false,
      resenasGoogle: false,
      resenasNativas: false,
      botonesNavegacion: false,
      productoDestacado: false,
      seoOptimizado: false,
      reportesMensuales: false,
    },
  },
  {
    id: "premium",
    nombre: "Premium",
    precio: 199,
    descripcion: "Para ópticas en crecimiento",
    caracteristicas: {
      fotos: 8,
      video: false,
      badgeVerificado: true,
      estadisticas: true,
      whatsapp: true,
      gestionContenido: false,
      accesoB2B: false,
      soporte: "Prioritario",
      fichaPublica: true,
      resenasGoogle: true,
      resenasNativas: false,
      botonesNavegacion: true,
      productoDestacado: false,
      seoOptimizado: false,
      reportesMensuales: true,
    },
  },
  {
    id: "premium_plus",
    nombre: "Premium+",
    precio: 599,
    descripcion: "Máxima visibilidad y acceso B2B",
    caracteristicas: {
      fotos: 12,
      video: true,
      badgeVerificado: true,
      estadisticas: true,
      whatsapp: true,
      gestionContenido: true,
      accesoB2B: true,
      soporte: "24/7",
      fichaPublica: true,
      resenasGoogle: true,
      resenasNativas: true,
      botonesNavegacion: true,
      productoDestacado: true,
      seoOptimizado: true,
      reportesMensuales: true,
    },
  },
];

const labelsCaracteristicas: Record<string, string> = {
  fotos: "Fotos en galería",
  video: "Video promocional",
  badgeVerificado: "Badge de verificado",
  estadisticas: "Estadísticas de visitas",
  whatsapp: "Botón de WhatsApp",
  gestionContenido: "Gestión de contenido incluida",
  accesoB2B: "Acceso a proveedores y servicios",
  soporte: "Soporte técnico",
  fichaPublica: "Ficha pública (mini página)",
  resenasGoogle: "Reseñas de Google Maps importadas",
  resenasNativas: "Reseñas nativas del sitio",
  botonesNavegacion: "Botones de cómo llegar (Waze y Google Maps)",
  productoDestacado: "Producto destacado en ficha",
  seoOptimizado: "SEO optimizado para Google",
  reportesMensuales: "Reportes mensuales de rendimiento",
};

export default function PlanPage() {
  const params = useParams();
  const opticaId = params.opticaId as string;

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [planSeleccionado, setPlanSeleccionado] = useState<string | null>(null);

  const [opticaData, setOpticaData] = useState({
    plan: "free",
    billingCycle: "monthly",
    fechaVencimiento: "",
    nombre: "",
  });

  useEffect(() => {
    const cargarOptica = async () => {
      try {
        const docRef = doc(db, "opticas", opticaId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setOpticaData({
            plan: data.plan || "free",
            billingCycle: data.billingCycle || "monthly",
            fechaVencimiento: data.fechaVencimiento || "",
            nombre: data.nombre || "",
          });
        }
      } catch (err) {
        console.error("Error al cargar:", err);
        setError("Error al cargar la información del plan");
      } finally {
        setCargando(false);
      }
    };

    if (opticaId) cargarOptica();
  }, [opticaId]);

  const calcularFechaVencimiento = (ciclo: string) => {
    const fecha = new Date();
    if (ciclo === "yearly") {
      fecha.setDate(fecha.getDate() + 365);
    } else {
      fecha.setDate(fecha.getDate() + 30);
    }
    return fecha.toISOString();
  };

  const cambiarPlan = async (nuevoPlan: string, billingCycle: string) => {
    setActualizando(true);
    setMensaje("");
    setError("");

    try {
      const fechaVencimiento = calcularFechaVencimiento(billingCycle);

      const docRef = doc(db, "opticas", opticaId);
      await setDoc(
        docRef,
        {
          plan: nuevoPlan,
          billingCycle: billingCycle,
          fechaVencimiento: fechaVencimiento,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setOpticaData({
        ...opticaData,
        plan: nuevoPlan,
        billingCycle: billingCycle,
        fechaVencimiento: fechaVencimiento,
      });

      setMensaje("Plan actualizado correctamente. Los cambios se reflejarán de inmediato.");
    } catch (err) {
      console.error("Error al actualizar:", err);
      setError("Error al actualizar el plan. Intenta de nuevo.");
    } finally {
      setActualizando(false);
    }
  };

  const obtenerDiasRestantes = () => {
    if (!opticaData.fechaVencimiento) return null;
    const vencimiento = new Date(opticaData.fechaVencimiento);
    const hoy = new Date();
    const diff = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const diasRestantes = obtenerDiasRestantes();

  const getEstadoPlan = () => {
    if (!diasRestantes) return { texto: "Sin fecha de vencimiento", color: "gray", urgente: false };
    if (diasRestantes <= 0) return { texto: "Plan vencido", color: "red", urgente: true };
    if (diasRestantes <= 15) return { texto: `Vence en ${diasRestantes} días`, color: "orange", urgente: true };
    if (diasRestantes <= 30) return { texto: `Vence en ${diasRestantes} días`, color: "yellow", urgente: false };
    return { texto: `Vence en ${diasRestantes} días`, color: "green", urgente: false };
  };

  const estadoPlan = getEstadoPlan();

  if (cargando) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-navy-700 animate-spin" />
      </div>
    );
  }

  const planActual = planes.find((p) => p.id === opticaData.plan);
  const planParaVistaPrevia = planSeleccionado 
    ? planes.find((p) => p.id === planSeleccionado) 
    : planActual;
  const fechaVenc = opticaData.fechaVencimiento ? new Date(opticaData.fechaVencimiento) : null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 font-display mb-2">
          Plan y facturación
        </h1>
        <p className="text-gray-600">
          Gestiona tu suscripción y elige el plan que mejor se adapte a tu óptica.
        </p>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-900">{mensaje}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      )}

      {/* Banner de ahorro anual */}
      {opticaData.billingCycle === "monthly" && opticaData.plan !== "free" && (
        <div className="mb-6 p-4 bg-navy-50 border border-navy-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-navy-700" />
            </div>
            <div>
              <p className="font-semibold text-navy-900 text-sm">
                Cambia a facturación anual y ahorra 25%
              </p>
              <p className="text-xs text-gray-600">
                Equivale a 3 meses gratis en tu suscripción
              </p>
            </div>
          </div>
          <button
            onClick={() => cambiarPlan(opticaData.plan, "yearly")}
            disabled={actualizando}
            className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          >
            Cambiar a anual
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan actual */}
          <div className="card-premium p-6 border-2 border-navy-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Plan actual
                </p>
                <h2 className="text-2xl font-bold text-navy-900 font-display">
                  {planActual?.nombre}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{planActual?.descripcion}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-navy-900">
                  ${planActual?.precio}
                </p>
                <p className="text-sm text-gray-600">
                  /{opticaData.billingCycle === "yearly" ? "año" : "mes"}
                </p>
              </div>
            </div>

            {fechaVenc && (
              <div className="flex items-center gap-6 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    Vence: {fechaVenc.toLocaleDateString("es-MX")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className={`w-4 h-4 ${
                    estadoPlan.color === "red" ? "text-red-600" :
                    estadoPlan.color === "orange" ? "text-orange-600" :
                    estadoPlan.color === "yellow" ? "text-yellow-600" :
                    "text-green-600"
                  }`} />
                  <span className={`font-medium ${
                    estadoPlan.color === "red" ? "text-red-700" :
                    estadoPlan.color === "orange" ? "text-orange-700" :
                    estadoPlan.color === "yellow" ? "text-yellow-700" :
                    "text-green-700"
                  }`}>
                    {estadoPlan.texto}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 capitalize">
                    Ciclo: {opticaData.billingCycle === "yearly" ? "anual" : "mensual"}
                  </span>
                </div>
              </div>
            )}

            {/* Características del plan actual */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Incluye en tu plan:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(planActual?.caracteristicas || {}).map(([key, value]) => {
                  if (key === "soporte") return null;
                  if (value === false) return null;
                  return (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">
                        {key === "fotos" ? `${value} fotos` : labelsCaracteristicas[key]}
                      </span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">
                    Soporte {planActual?.caracteristicas.soporte}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones para cambiar ciclo de facturación */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Cambiar ciclo de facturación:
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => cambiarPlan(opticaData.plan, "monthly")}
                  disabled={actualizando || opticaData.billingCycle === "monthly"}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
                    opticaData.billingCycle === "monthly"
                      ? "bg-navy-900 text-white"
                      : "border-2 border-navy-900 text-navy-900 hover:bg-navy-50"
                  }`}
                >
                  {opticaData.billingCycle === "monthly" ? "Ciclo actual" : "Mensual"}
                </button>
                <button
                  onClick={() => cambiarPlan(opticaData.plan, "yearly")}
                  disabled={actualizando || opticaData.billingCycle === "yearly"}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
                    opticaData.billingCycle === "yearly"
                      ? "bg-navy-900 text-white"
                      : "border-2 border-navy-900 text-navy-900 hover:bg-navy-50"
                  }`}
                >
                  {opticaData.billingCycle === "yearly" ? "Ciclo actual" : "Anual (ahorra 25%)"}
                </button>
              </div>
            </div>
          </div>

          {/* Tabla comparativa de planes */}
          <div>
            <h2 className="text-2xl font-bold text-navy-900 font-display mb-2">
              Comparar planes
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Elige el plan que mejor se adapte a las necesidades de tu óptica.
            </p>

            <div className="card-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 w-1/3">
                        Característica
                      </th>
                      {planes.map((plan) => (
                        <th
                          key={plan.id}
                          className={`p-4 text-center text-sm font-semibold ${
                            plan.id === opticaData.plan
                              ? "text-navy-900 bg-navy-50"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span>{plan.nombre}</span>
                            <span className="text-xs font-normal text-gray-500">
                              ${plan.precio}/{plan.id === "free" ? "siempre" : opticaData.billingCycle === "yearly" ? "año" : "mes"}
                            </span>
                            {plan.id === opticaData.plan && (
                              <span className="text-xs bg-navy-900 text-white px-2 py-0.5 rounded-full">
                                Actual
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(labelsCaracteristicas).map((key) => (
                      <tr key={key} className="border-b border-gray-100 last:border-0">
                        <td className="p-4 text-sm text-gray-700">
                          {labelsCaracteristicas[key]}
                        </td>
                        {planes.map((plan) => {
                          const valor = plan.caracteristicas[key as keyof typeof plan.caracteristicas];
                          const esPlanActual = plan.id === opticaData.plan;
                          const planActualIndex = planes.findIndex(p => p.id === opticaData.plan);
                          const estePlanIndex = planes.findIndex(p => p.id === plan.id);
                          const esMejorPlan = estePlanIndex > planActualIndex;

                          let contenido;
                          if (key === "fotos") {
                            contenido = (
                              <span className="text-sm font-medium text-gray-900">
                                {valor} fotos
                              </span>
                            );
                          } else if (key === "soporte") {
                            contenido = (
                              <span className="text-sm text-gray-700">{valor}</span>
                            );
                          } else if (valor === true) {
                            contenido = (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            );
                          } else {
                            contenido = (
                              <X className="w-5 h-5 text-gray-300 mx-auto" />
                            );
                          }

                          return (
                            <td
                              key={plan.id}
                              className={`p-4 text-center ${
                                esPlanActual ? "bg-navy-50" : ""
                              }`}
                            >
                              {esMejorPlan && valor === false ? (
                                <button
                                  onClick={() => {
                                    setPlanSeleccionado(plan.id);
                                    cambiarPlan(plan.id, opticaData.billingCycle);
                                  }}
                                  disabled={actualizando}
                                  className="text-xs text-navy-700 hover:text-navy-900 font-medium transition-colors disabled:opacity-50"
                                >
                                  Mejorar plan
                                </button>
                              ) : (
                                contenido
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Garantía y testimonio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Garantía */}
            <div className="card-premium p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 mb-1">
                    Garantía de satisfacción de 15 días
                  </h3>
                  <p className="text-sm text-gray-600">
                    Si no estás satisfecho con tu plan Premium o Premium+, te devolvemos el 100% de tu inversión durante los primeros 15 días. Sin preguntas.
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonio */}
            <div className="card-premium p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-gold-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 italic mb-2">
                    "Desde que cambiamos a Premium+, nuestras visitas aumentaron 3 veces y conseguimos 2 proveedores nuevos para la óptica."
                  </p>
                  <p className="text-xs font-semibold text-gray-900">
                    Óptica Visión Clara, CDMX
                  </p>
                  <p className="text-xs text-gray-500">
                    Plan Premium+ desde hace 8 meses
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA de mejora */}
          {opticaData.plan !== "premium_plus" && (
            <div className="card-premium p-6 bg-gradient-to-br from-gold-50 to-gold-100 border-2 border-gold-300">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-gold-700" />
                    <h3 className="text-lg font-bold text-navy-900 font-display">
                      Lleva tu óptica al siguiente nivel
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Con Premium+ obtienes 12 fotos, video promocional, badge de verificado, acceso a proveedores calificados, reseñas nativas y gestión de contenido incluida.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-navy-700 rounded text-xs font-medium">
                      <Check className="w-3 h-3" /> 12 fotos
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-navy-700 rounded text-xs font-medium">
                      <Check className="w-3 h-3" /> Video
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-navy-700 rounded text-xs font-medium">
                      <Check className="w-3 h-3" /> Badge verificado
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-navy-700 rounded text-xs font-medium">
                      <Check className="w-3 h-3" /> Acceso B2B
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-navy-700 rounded text-xs font-medium">
                      <Check className="w-3 h-3" /> Reseñas nativas
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => cambiarPlan("premium_plus", opticaData.billingCycle)}
                  disabled={actualizando}
                  className="px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap shadow-lg"
                >
                  {actualizando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Mejorar a Premium+
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Panel de vista previa */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="card-premium p-6">
              <h3 className="text-lg font-bold text-navy-900 font-display mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Vista previa de tu ficha
              </h3>
              
              {planSeleccionado && planSeleccionado !== opticaData.plan && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-900">
                    Vista previa con plan {planes.find(p => p.id === planSeleccionado)?.nombre}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {/* Badge de verificado */}
                {planParaVistaPrevia?.caracteristicas.badgeVerificado && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Award className="w-5 h-5 text-green-700" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">Óptica Verificada</p>
                      <p className="text-xs text-green-700">Badge de confianza</p>
                    </div>
                  </div>
                )}

                {/* Galería de fotos */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Galería ({planParaVistaPrevia?.caracteristicas.fotos} fotos)
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>

                {/* Video */}
                {planParaVistaPrevia?.caracteristicas.video && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      Video promocional
                    </p>
                    <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Reseñas */}
                {planParaVistaPrevia?.caracteristicas.resenasGoogle && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Reseñas Google Maps
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">4.9 (127)</span>
                      </div>
                      <p className="text-xs text-gray-600 italic">"Excelente servicio..."</p>
                    </div>
                  </div>
                )}

                {planParaVistaPrevia?.caracteristicas.resenasNativas && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Reseñas nativas
                    </p>
                    <div className="p-3 bg-navy-50 rounded-lg border border-navy-200">
                      <p className="text-xs text-navy-700 italic">"La mejor óptica de la zona..."</p>
                    </div>
                  </div>
                )}

                {/* Botones de navegación */}
                {planParaVistaPrevia?.caracteristicas.botonesNavegacion && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Cómo llegar
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-blue-500 text-white text-xs rounded font-medium">
                        Google Maps
                      </button>
                      <button className="flex-1 px-3 py-2 bg-cyan-500 text-white text-xs rounded font-medium">
                        Waze
                      </button>
                    </div>
                  </div>
                )}

                {/* Producto destacado */}
                {planParaVistaPrevia?.caracteristicas.productoDestacado && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Producto destacado
                    </p>
                    <div className="p-3 bg-gold-50 rounded-lg border border-gold-200">
                      <div className="aspect-video bg-gray-200 rounded mb-2" />
                      <p className="text-xs font-semibold text-navy-900">Armazón Premium</p>
                      <p className="text-xs text-gray-600">$2,499</p>
                    </div>
                  </div>
                )}

                {/* SEO y reportes */}
                {(planParaVistaPrevia?.caracteristicas.seoOptimizado || planParaVistaPrevia?.caracteristicas.reportesMensuales) && (
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    {planParaVistaPrevia?.caracteristicas.seoOptimizado && (
                      <div className="flex items-center gap-2 text-xs">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-gray-700">SEO optimizado</span>
                      </div>
                    )}
                    {planParaVistaPrevia?.caracteristicas.reportesMensuales && (
                      <div className="flex items-center gap-2 text-xs">
                        <FileText className="w-3 h-3 text-green-600" />
                        <span className="text-gray-700">Reportes mensuales</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {planSeleccionado && planSeleccionado !== opticaData.plan && (
                <button
                  onClick={() => setPlanSeleccionado(null)}
                  className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Volver al plan actual
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}