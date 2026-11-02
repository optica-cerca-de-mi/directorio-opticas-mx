"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Eye,
  Phone,
  MessageCircle,
  MapPin,
  CalendarDays,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Image as ImageIcon,
  Crown,
  Check,
  AlertCircle,
  CreditCard,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DashboardHome() {
  const params = useParams();
  const opticaId = params.opticaId as string;
  const [optica, setOptica] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarOptica = async () => {
      try {
        const docRef = doc(db, "opticas", opticaId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOptica(docSnap.data());
        }
      } catch (error) {
        console.error("Error al cargar la óptica:", error);
      } finally {
        setCargando(false);
      }
    };

    if (opticaId) {
      cargarOptica();
    }
  }, [opticaId]);

  // Métricas de ejemplo (en producción vendrán de la base de datos)
  const metricas = [
    {
      titulo: "Visitas a la ficha",
      valor: "1,247",
      cambio: "+12.5%",
      tendencia: "up",
      icono: Eye,
      color: "bg-blue-100 text-blue-700",
    },
    {
      titulo: "Clics en WhatsApp",
      valor: "89",
      cambio: "+23.1%",
      tendencia: "up",
      icono: MessageCircle,
      color: "bg-green-100 text-green-700",
    },
    {
      titulo: "Llamadas telefónicas",
      valor: "34",
      cambio: "-5.2%",
      tendencia: "down",
      icono: Phone,
      color: "bg-purple-100 text-purple-700",
    },
    {
      titulo: "Cómo llegar (Maps)",
      valor: "156",
      cambio: "+8.7%",
      tendencia: "up",
      icono: MapPin,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  if (cargando) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-navy-700 animate-spin" />
      </div>
    );
  }

  if (!optica) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No se encontró la óptica</p>
      </div>
    );
  }

  // Calcular días restantes
  const fechaVencimiento = new Date(optica.fechaVencimiento);
  const hoy = new Date();
  const diasRestantes = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  const getEstadoPago = () => {
    if (diasRestantes <= 0) {
      return {
        color: "bg-red-50 border-red-300",
        icono: AlertCircle,
        iconoColor: "text-red-600",
        titulo: "Plan vencido",
        mensaje: "Tu plan ha expirado. Renueva ahora para mantener tu visibilidad.",
        urgencia: "high",
      };
    } else if (diasRestantes <= 15) {
      return {
        color: "bg-orange-50 border-orange-300",
        icono: AlertCircle,
        iconoColor: "text-orange-600",
        titulo: "Plan por vencer",
        mensaje: `Solo te quedan ${diasRestantes} días. Renueva pronto para no perder visibilidad.`,
        urgencia: "medium",
      };
    } else {
      return {
        color: "bg-green-50 border-green-300",
        icono: Check,
        iconoColor: "text-green-600",
        titulo: "Plan activo",
        mensaje: `Tu plan está activo. Te quedan ${diasRestantes} días (${Math.floor(diasRestantes / 30)} meses).`,
        urgencia: "low",
      };
    }
  };

  const estadoPago = getEstadoPago();
  const IconoEstado = estadoPago.icono;

  const montoPlan = optica.plan === "premium" ? (optica.billingCycle === "yearly" ? "$1,990" : "$199") : optica.plan === "premium_plus" ? (optica.billingCycle === "yearly" ? "$5,391" : "$599") : "$0";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 font-display mb-2">
          Resumen de tu óptica
        </h1>
        <p className="text-gray-600">
          {optica.nombre} • Plan {optica.plan === "premium_plus" ? "Premium+" : optica.plan === "premium" ? "Premium" : "Básico"}
        </p>
      </div>

      {/* AVISO DE SUSCRIPCIÓN */}
      {optica.plan !== "free" && (
        <div className={`card-premium p-6 mb-8 border-2 ${estadoPago.color} relative`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                estadoPago.urgencia === "high" ? "bg-red-100" : 
                estadoPago.urgencia === "medium" ? "bg-orange-100" : "bg-green-100"
              }`}>
                <IconoEstado className={`w-6 h-6 ${estadoPago.iconoColor}`} />
              </div>
              <div>
                <h3 className="font-bold text-navy-900 text-lg mb-1">
                  {estadoPago.titulo}
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  {estadoPago.mensaje}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    Vence: {fechaVencimiento.toLocaleDateString("es-MX")}
                  </span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Próximo pago: {montoPlan} {optica.billingCycle === "yearly" ? "(anual)" : "(mensual)"}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/dashboard/${opticaId}/plan`}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-premium)] font-bold text-sm transition-all whitespace-nowrap ${
                estadoPago.urgencia === "high"
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                  : estadoPago.urgencia === "medium"
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                  : "bg-navy-900 hover:bg-navy-800 text-white"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Pagar siguiente período
            </Link>
          </div>
        </div>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricas.map((metrica, i) => {
          const Icono = metrica.icono;
          return (
            <div key={i} className="card-premium p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${metrica.color} rounded-lg flex items-center justify-center`}>
                  <Icono className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  metrica.tendencia === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {metrica.tendencia === "up" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {metrica.cambio}
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-navy-900 mb-1">
                  {metrica.valor}
                </p>
                <p className="text-sm text-gray-600">{metrica.titulo}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico de actividad y acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de visitas (placeholder) */}
        <div className="lg:col-span-2 card-premium p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4 font-display">
            Actividad de los últimos 30 días
          </h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Gráfico de visitas e interacciones
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (Integrar con Chart.js o Recharts)
              </p>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="card-premium p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4 font-display">
            Acciones rápidas
          </h2>
          <div className="space-y-3">
            <Link
              href={`/dashboard/${opticaId}/info`}
              className="flex items-center gap-3 p-3 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5 text-navy-700" />
              <span className="text-sm font-medium text-navy-900">
                Editar información
              </span>
            </Link>
            <Link
              href={`/dashboard/${opticaId}/galeria`}
              className="flex items-center gap-3 p-3 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors"
            >
              <ImageIcon className="w-5 h-5 text-navy-700" />
              <span className="text-sm font-medium text-navy-900">
                Subir fotos
              </span>
            </Link>
            <Link
              href={`/dashboard/${opticaId}/plan`}
              className="flex items-center gap-3 p-3 bg-gold-50 hover:bg-gold-100 rounded-lg transition-colors"
            >
              <Crown className="w-5 h-5 text-gold-700" />
              <span className="text-sm font-medium text-navy-900">
                Mejorar plan
              </span>
            </Link>
            <Link
              href={`/dashboard/${opticaId}/info`}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CalendarDays className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-900">
                Actualizar horarios
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Estado de la ficha */}
      <div className="mt-6 card-premium p-6">
        <h2 className="text-xl font-bold text-navy-900 mb-4 font-display">
          Estado de tu ficha
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="font-semibold text-green-900 text-sm">Ficha publicada</p>
              <p className="text-xs text-green-700">Visible en el directorio</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 text-sm">Calificación: 4.9</p>
              <p className="text-xs text-blue-700">247 reseñas en Google</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gold-50 rounded-lg border border-gold-200">
            <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-gold-700" />
            </div>
            <div>
              <p className="font-semibold text-gold-900 text-sm">Plan {optica.plan === "premium_plus" ? "Premium+" : optica.plan === "premium" ? "Premium" : "Básico"}</p>
              <p className="text-xs text-gold-700">Próxima renovación: {fechaVencimiento.toLocaleDateString("es-MX")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}