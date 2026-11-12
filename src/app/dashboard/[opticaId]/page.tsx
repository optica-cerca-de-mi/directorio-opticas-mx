"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays, CreditCard, Loader2, Check, AlertCircle,
  Sparkles, Eye, MessageCircle, Trophy, ArrowUpRight,
  Image as ImageIcon, Star, Wand2
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Integraciones de OptiRelevance Engine
import {
  getKPIData, getEvolucionVisitas, getOrigenVisitas, getUsoPlan, getEstadoFicha,
  KPIData, PuntoEvolucion, OrigenVisitas, UsoPlan, EstadoFicha,
} from "@/lib/dashboard-analytics";
import KPICard from "@/components/dashboard/KPICard";
import DonutChart from "@/components/dashboard/DonutChart";
import LineChart from "@/components/dashboard/LineChart";
import BarChart from "@/components/dashboard/BarChart";

export default function DashboardHome() {
  const params = useParams();
  const opticaId = params.opticaId as string;
  
  // Estado de la óptica
  const [optica, setOptica] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // Estado de OptiRelevance
  const [kpi, setKpi] = useState<KPIData | null>(null);
  const [evolucion, setEvolucion] = useState<PuntoEvolucion[]>([]);
  const [origen, setOrigen] = useState<OrigenVisitas[]>([]);
  const [usoPlan, setUsoPlan] = useState<UsoPlan[]>([]);
  const [estadoFicha, setEstadoFicha] = useState<EstadoFicha | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const docRef = doc(db, "opticas", opticaId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setOptica({ id: docSnap.id, ...data });

          const planActual = data.plan || "free";
          
          // Cargar todas las métricas en paralelo
          const [k, e, o, u, s] = await Promise.all([
            getKPIData(opticaId),
            getEvolucionVisitas(opticaId, 30),
            getOrigenVisitas(opticaId),
            getUsoPlan(opticaId, planActual),
            getEstadoFicha(opticaId),
          ]);

          setKpi(k);
          setEvolucion(e);
          setOrigen(o);
          setUsoPlan(u);
          setEstadoFicha(s);
        }
      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
      } finally {
        setCargando(false);
      }
    };

    if (opticaId) cargarDatos();
  }, [opticaId]);

  if (cargando) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-navy-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu panel de control...</p>
        </div>
      </div>
    );
  }

  if (!optica) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">No se encontró la óptica</p>
        <Link href="/registro" className="btn-primary">Registrar una óptica</Link>
      </div>
    );
  }

  const fechaVencimiento = optica.fechaVencimiento ? new Date(optica.fechaVencimiento) : new Date();
  const hoy = new Date();
  const diasRestantes = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  const getEstadoPago = () => {
    if (diasRestantes <= 0) return { color: "bg-red-50 border-red-300", icono: AlertCircle, iconoColor: "text-red-600", titulo: "Plan vencido", mensaje: "Tu plan ha expirado. Renueva ahora para mantener tu visibilidad.", urgencia: "high" };
    if (diasRestantes <= 15) return { color: "bg-orange-50 border-orange-300", icono: AlertCircle, iconoColor: "text-orange-600", titulo: "Plan por vencer", mensaje: `Solo te quedan ${diasRestantes} días. Renueva pronto.`, urgencia: "medium" };
    return { color: "bg-green-50 border-green-300", icono: Check, iconoColor: "text-green-600", titulo: "Plan activo", mensaje: `Tu plan está activo. Te quedan ${diasRestantes} días.`, urgencia: "low" };
  };

  const estadoPago = getEstadoPago();
  const IconoEstado = estadoPago.icono;
  const montoPlan = optica.plan === "premium" ? (optica.billingCycle === "yearly" ? "$1,990" : "$199") : optica.plan === "premium_plus" ? (optica.billingCycle === "yearly" ? "$5,391" : "$599") : "$0";
  
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER DE BIENVENIDA */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-navy-900 font-display mb-2">{saludo}, bienvenido de nuevo</h1>
        <p className="text-gray-600">{optica.nombre} • Plan {optica.plan === "premium_plus" ? "Premium+" : optica.plan === "premium" ? "Premium" : "Básico"}</p>
      </div>

      {/* AVISO DE SUSCRIPCIÓN (Lógica original conservada) */}
      {optica.plan !== "free" && (
        <div className={`card-premium p-6 border-2 ${estadoPago.color} relative rounded-xl`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${estadoPago.urgencia === "high" ? "bg-red-100" : estadoPago.urgencia === "medium" ? "bg-orange-100" : "bg-green-100"}`}>
                <IconoEstado className={`w-6 h-6 ${estadoPago.iconoColor}`} />
              </div>
              <div>
                <h3 className="font-bold text-navy-900 text-lg mb-1">{estadoPago.titulo}</h3>
                <p className="text-sm text-gray-700 mb-2">{estadoPago.mensaje}</p>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Vence: {fechaVencimiento.toLocaleDateString("es-MX")}</span>
                  <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> Próximo pago: {montoPlan} {optica.billingCycle === "yearly" ? "(anual)" : "(mensual)"}</span>
                </div>
              </div>
            </div>
            <Link href={`/dashboard/${opticaId}/plan`} className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${estadoPago.urgencia === "high" ? "bg-red-600 hover:bg-red-700 text-white shadow-lg" : estadoPago.urgencia === "medium" ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg" : "bg-navy-900 hover:bg-navy-800 text-white"}`}>
              <CreditCard className="w-4 h-4" /> Pagar siguiente período
            </Link>
          </div>
        </div>
      )}

      {/* GRID DE KPIs (OPTI RELEVANCE ENGINE) */}
      {kpi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard etiqueta="Índice de Relevancia" valor={kpi.relevanciaScore} sufijo="/100" variacion={kpi.relevanciaVariacion} icono={<Sparkles className="w-5 h-5 text-white" />} colorIcono="bg-gradient-to-br from-amber-500 to-amber-600" subtitulo="Visibilidad en Franklin" />
          <KPICard etiqueta="Visitas a tu ficha" valor={kpi.visitas30d} variacion={kpi.visitasVariacion} icono={<Eye className="w-5 h-5 text-white" />} colorIcono="bg-gradient-to-br from-blue-500 to-blue-600" subtitulo="Últimos 30 días" />
          <KPICard etiqueta="Clics en WhatsApp" valor={kpi.clicsWhatsApp30d} variacion={kpi.clicsVariacion} icono={<MessageCircle className="w-5 h-5 text-white" />} colorIcono="bg-gradient-to-br from-green-500 to-green-600" subtitulo="Contactos directos" />
          <KPICard etiqueta="Posición promedio" valor={`#${kpi.posicionPromedio}`} variacion={kpi.posicionVariacion} icono={<Trophy className="w-5 h-5 text-white" />} colorIcono="bg-gradient-to-br from-purple-500 to-purple-600" invertido={true} subtitulo="En búsquedas de tu zona" />
        </div>
      )}

      {/* FILA MEDIA: Estado de ficha + Uso de plan */}
      {estadoFicha && usoPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-navy-900">Estado de tu ficha</h3>
              <Link href={`/dashboard/${opticaId}/disenar-ficha`} className="text-xs text-navy-700 hover:underline font-medium">Necesito ayuda</Link>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <DonutChart 
                segmentos={[
                  { valor: estadoFicha.excelente, color: "#00a650", etiqueta: "Excelente" }, 
                  { valor: estadoFicha.bueno, color: "#fff159", etiqueta: "Bueno" }, 
                  { valor: estadoFicha.porMejorar, color: "#ff4444", etiqueta: "Por mejorar" }
                ]} 
                tamano={120} 
                grosor={18} 
                centroTexto={`${kpi?.relevanciaScore || 0}`} 
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: "#ff4444" }}></span><span className="text-gray-600">Por mejorar</span></div>
                  <span className="font-semibold text-navy-900">{estadoFicha.porMejorar}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: "#fff159" }}></span><span className="text-gray-600">Bueno</span></div>
                  <span className="font-semibold text-navy-900">{estadoFicha.bueno}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: "#00a650" }}></span><span className="text-gray-600">Excelente</span></div>
                  <span className="font-semibold text-navy-900">{estadoFicha.excelente}%</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[11px] text-gray-500 leading-relaxed">Tu índice de relevancia determina en qué posición aparece tu óptica cuando un paciente busca en Franklin.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-navy-900">Uso de tu plan {optica.plan === "premium_plus" ? "Premium+" : optica.plan === "premium" ? "Premium" : "Básico"}</h3>
              <Link href={`/dashboard/${opticaId}/plan`} className="text-xs text-navy-700 hover:underline font-medium flex items-center gap-1">Ver plan completo <ArrowUpRight className="w-3 h-3" /></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usoPlan.map((u: any) => {
                const porcentaje = Math.min((u.usado / u.maximo) * 100, 100);
                const colorBarra = porcentaje >= 90 ? "#ff4444" : porcentaje >= 70 ? "#fff159" : "#00a650";
                return (
                  <div key={u.recurso} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700">{u.etiqueta}</span>
                      <span className="text-[10px] text-gray-500">{u.usado} de {u.maximo} {u.maximo === 999 ? "ilimitado" : "u."}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${porcentaje}%`, backgroundColor: colorBarra }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FILA INFERIOR: Evolución + Origen */}
      {evolucion.length > 0 && origen.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-navy-900">Evolución de tus visitas</h3>
              <span className="text-xs text-gray-500">Últimos 30 días</span>
            </div>
            <LineChart datos={evolucion} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-navy-900">Cómo te encuentran</h3>
            </div>
            <BarChart datos={origen} />
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[11px] text-gray-500 leading-relaxed"><strong className="text-navy-900">Tip:</strong> Las ópticas con más bloques de contenido enriquecido reciben hasta 3x más visitas desde Franklin.</p>
            </div>
          </div>
        </div>
      )}

      {/* SUGERENCIAS ACCIONABLES */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center"><Star className="w-4 h-4 text-amber-600" /></div>
            <div>
              <h3 className="text-sm font-bold text-navy-900">Acciones recomendadas para ti</h3>
              <p className="text-xs text-gray-500">Basadas en tu índice de relevancia actual</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4 text-amber-600" /><span className="text-xs font-bold text-amber-900">Prioridad alta</span></div>
            <p className="text-sm text-gray-800 mb-2">Agrega 2 bloques de contenido enriquecido</p>
            <p className="text-[11px] text-gray-600 mb-3">Subirá tu Quality Score de 60 a 80 puntos</p>
            <Link href={`/dashboard/${opticaId}/disenar-ficha`} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:underline">Mejorar ahora <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2"><ImageIcon className="w-4 h-4 text-blue-600" /><span className="text-xs font-bold text-blue-900">Recomendado</span></div>
            <p className="text-sm text-gray-800 mb-2">Sube 3 fotos más de tu local</p>
            <p className="text-[11px] text-gray-600 mb-3">Las fichas con 5+ fotos reciben 40% más clics</p>
            <Link href={`/dashboard/${opticaId}/galeria`} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:underline">Subir fotos <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2"><Check className="w-4 h-4 text-green-600" /><span className="text-xs font-bold text-green-900">Completado</span></div>
            <p className="text-sm text-gray-800 mb-2">Especialidades personalizadas activas</p>
            <p className="text-[11px] text-gray-600 mb-3">Tienes 5 especialidades de nicho indexadas</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">Excelente trabajo</span>
          </div>
        </div>
      </div>
    </div>
  );
}