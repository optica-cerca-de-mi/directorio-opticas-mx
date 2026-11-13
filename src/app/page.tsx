"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Star, MapPin, ShieldCheck, Crown, Sparkles,
  ChevronRight, Award, ArrowRight, Zap, Target,
  Building2, Store, Glasses, ScanEye,
  Contact, EyeOff, Sun
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useOptiRank } from "@/hooks/useOptiRank";
import { estaAbiertaEn } from "@/lib/ranking-engine";
import { Optica } from "@/types/optica";
import { useUserLocation } from "@/hooks/useUserLocation";
import { AdSlot } from "@/components/OptiAdBoost";
import FooterPublico from "@/components/FooterPublico";
import GoogleLiveBadge from "@/components/GoogleLiveBadge";
import GoogleMapsModal from "@/components/GoogleMapsModal";
import { FranklinModule } from "@/components/Franklin";

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════
interface OpticaTop {
  id: string;
  nombre: string;
  nombreComercial?: string;
  ciudad?: string;
  estado?: string;
  plan?: string;
  calificacionGoogle?: number;
  numResenas?: number;
  especialidades?: string[];
  especialidadesPersonalizadas?: string[];
  segurosAceptados?: string[];
  fotos?: Array<{ url: string }>;
  logo?: string;
  slug?: string;
  descripcion?: string;
  horarios?: Array<{ dia: string; apertura: string; cierre: string; cerrado: boolean }>;
  verificada?: boolean;
  whatsapp?: string;
  telefono?: string;
  urlGoogleMaps?: string;
  latitud?: number;
  longitud?: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-bold text-gold-400">
      {count}{suffix}
    </div>
  );
}

function BannerPropio() {
  return (
    <section className="py-12 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-y border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1">Publicidad</p>
              <h3 className="text-xl md:text-2xl font-bold text-navy-900 mb-2 font-display">
                Eres proveedor de lentes o armazones?
              </h3>
              <p className="text-sm text-gray-700 max-w-xl">
                Llega a miles de opticas en todo Mexico. Anunciate en el directorio lider del sector optico y aumenta tus ventas.
              </p>
            </div>
          </div>
          <Link href="/contacto-publicidad" className="px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors flex-shrink-0 shadow-lg hover:shadow-xl flex items-center gap-2">
            Conoce mas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// DATOS MAESTROS
// ═══════════════════════════════════════════════════════════════
const ESPECIALIDADES = [
  { nombre: "Optometria General", icono: Star, slug: "optometria" },
  { nombre: "Lentes de Contacto", icono: Contact, slug: "contactologia" },
  { nombre: "Lentes Progresivos", icono: Glasses, slug: "progresivos" },
  { nombre: "Lentes Antiblue", icono: Sun, slug: "antiblue" },
  { nombre: "Examen de la Vista", icono: ScanEye, slug: "examen-vista" },
  { nombre: "Lentes Solares", icono: EyeOff, slug: "lentes-solares" },
];

const SUGERENCIAS_RAPIDAS = [
  "Me empeoro la vista, necesito examen",
  "Lentes de contacto en CDMX",
  "Optica que acepte GNP",
  "Lentes para computadora",
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function HomePage() {
  const [opticas, setOpticas] = useState<OpticaTop[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOpticas: 0, totalCiudades: 0, totalEspecialidades: 0 });
  const [mapsModal, setMapsModal] = useState<{ isOpen: boolean; optica: OpticaTop | null }>({ isOpen: false, optica: null });
  const { location, consent } = useUserLocation();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "opticas"));
        const opticasData: OpticaTop[] = [];
        const ciudadesSet = new Set<string>();
        const especialidadesSet = new Set<string>();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.estado !== "inactiva" && data.estado !== "eliminada") {
            const nombre = data.nombre || data.nombreComercial || "Sin nombre";
            opticasData.push({
              id: doc.id, nombre, ciudad: data.ciudad, estado: data.estado, plan: data.plan || "free",
              calificacionGoogle: data.calificacionGoogle, numResenas: data.numResenas,
              especialidades: data.especialidades || [],
              especialidadesPersonalizadas: data.especialidadesPersonalizadas || [],
              segurosAceptados: data.segurosAceptados || [],
              fotos: data.fotos || [], logo: data.logo,
              slug: data.slug || doc.id, descripcion: data.descripcion, horarios: data.horarios || [], latitud: data.latitud ?? null, longitud: data.longitud ?? null,
              verificada: data.verificado || data.plan !== "free", whatsapp: data.whatsapp,
              telefono: data.telefono, urlGoogleMaps: data.urlGoogleMaps,
            } as OpticaTop);

            if (data.ciudad) ciudadesSet.add(data.ciudad);
            (data.especialidades || []).forEach((e: string) => especialidadesSet.add(e));
            (data.especialidadesPersonalizadas || []).forEach((e: string) => especialidadesSet.add(e));
          }
        });

        setOpticas(opticasData);
        setStats({ totalOpticas: opticasData.length, totalCiudades: ciudadesSet.size, totalEspecialidades: especialidadesSet.size });
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const { opticasRanking } = useOptiRank({
    opticas: opticas as unknown as Optica[],
    contexto: { horaActual: new Date(), dispositivo: "desktop", sessionId: "home" },
    topRecomendadas: 3, autoTrack: false,
  });

  const top3 = opticasRanking.slice(0, 3);

  const badgesHumanos = [
    {
      titulo: "La mas recomendada", subtitulo: "Elegida por nuestra comunidad",
      razon: (o: OpticaTop) => {
        const razones = [];
        if (o.calificacionGoogle) razones.push(`${o.calificacionGoogle}★`);
        const { abierta } = estaAbiertaEn(o.horarios || []);
        if (abierta) razones.push("abierta ahora");
        if (o.whatsapp) razones.push("WhatsApp activo");
        if (o.verificada) razones.push("verificada");
        return razones.length > 0 ? `Recomendada por: ${razones.join(", ")}` : "Recomendada por su ficha completa";
      },
      icono: Award, color: "from-amber-500 to-amber-600", bgColor: "bg-amber-50", textColor: "text-amber-900", borderColor: "border-amber-200",
    },
    {
      titulo: "Calificacion perfecta", subtitulo: "Excelencia comprobada",
      razon: (o: OpticaTop) => {
        const razones = [];
        if (o.calificacionGoogle) razones.push(`${o.calificacionGoogle}★`);
        const { abierta } = estaAbiertaEn(o.horarios || []);
        if (abierta) razones.push("abierta ahora");
        if (o.whatsapp) razones.push("WhatsApp activo");
        if (o.verificada) razones.push("verificada premium");
        return razones.length > 0 ? `Recomendada por: ${razones.join(", ")}` : "Recomendada por su ficha completa";
      },
      icono: Star, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", textColor: "text-blue-900", borderColor: "border-blue-200",
    },
    {
      titulo: "Experiencia garantizada", subtitulo: "Servicio de confianza",
      razon: (o: OpticaTop) => {
        const razones = [];
        if (o.calificacionGoogle) razones.push(`${o.calificacionGoogle}★`);
        const { abierta } = estaAbiertaEn(o.horarios || []);
        if (abierta) razones.push("abierta ahora");
        if (o.whatsapp) razones.push("WhatsApp activo");
        return razones.length > 0 ? `Recomendada por: ${razones.join(", ")}` : "Recomendada por su ficha completa";
      },
      icono: ShieldCheck, color: "from-green-500 to-green-600", bgColor: "bg-green-50", textColor: "text-green-900", borderColor: "border-green-200",
    },
  ];

  const beneficios = [
    { icono: Star, titulo: "Encuentra rapido", descripcion: "Busca opticas por ciudad, especialidad o seguro medico en segundos." },
    { icono: Star, titulo: "Resenas reales", descripcion: "Opiniones verificadas de pacientes reales para tomar la mejor decision." },
    { icono: MapPin, titulo: "Cerca de ti", descripcion: "Geolocalizacion inteligente para encontrar las opticas mas cercanas." },
    { icono: ShieldCheck, titulo: "Opticas verificadas", descripcion: "Todas las opticas premium estan verificadas y actualizadas." },
    { icono: ChevronRight, titulo: "Horarios en vivo", descripcion: "Sabe al instante si una optica esta abierta ahora mismo." },
    { icono: Star, titulo: "Contacto directo", descripcion: "WhatsApp, llamada o Waze con un solo clic." },
  ];

  const razonesRecomendacion = [
    { icono: Target, titulo: "Ranking inteligente", descripcion: "Nuestro algoritmo OptiRank analiza calificacion, ubicacion, horarios y completitud de ficha para recomendarte las mejores opciones." },
    { icono: Target, titulo: "Basado en tu perfil", descripcion: "Detectamos si buscas urgencia, planificacion o exploracion, y ajustamos el orden segun lo que mas te importa." },
    { icono: Star, titulo: "Transparencia total", descripcion: "Mostramos resenas reales de Google, horarios actualizados y toda la informacion que necesitas sin sorpresas." },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <GoogleMapsModal
        isOpen={mapsModal.isOpen}
        onClose={() => setMapsModal({ isOpen: false, optica: null })}
        nombre={mapsModal.optica?.nombre || ""}
        urlGoogleMaps={mapsModal.optica?.urlGoogleMaps || ""}
      />

      {/* ═══════════════════════════════════════════════════════════
          HERO INSPIRADO EN DOCTORALIA
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white overflow-hidden pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-4 leading-tight">
            Encuentra la atencion que necesitas
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Describe que te pasa o a quien buscas, y te ayudaremos a encontrar la optica perfecta.
          </p>

          {/* ✅ MÓDULO FRANKLIN AISLADO */}
          <FranklinModule
            opticas={opticas}
            opticasRanking={opticasRanking as unknown as OpticaTop[]}
            sugerencias={SUGERENCIAS_RAPIDAS}
          />

          {/* Contadores */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <AnimatedCounter end={stats.totalOpticas} />
              <div className="text-sm text-gray-400 mt-1">Opticas registradas</div>
            </div>
            <div className="text-center">
              <AnimatedCounter end={stats.totalCiudades} />
              <div className="text-sm text-gray-400 mt-1">Ciudades</div>
            </div>
            <div className="text-center">
              <AnimatedCounter end={stats.totalEspecialidades} />
              <div className="text-sm text-gray-400 mt-1">Especialidades</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GRID DE ESPECIALIDADES
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 font-display mb-4">
              Encuentra Especialistas en Salud Visual
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Navega por especialidades y encuentra la optica perfecta para tus necesidades especificas.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ESPECIALIDADES.map((esp) => {
              const Icono = esp.icono;
              return (
                <Link
                  key={esp.slug}
                  href={`/opticas?especialidad=${esp.slug}`}
                  className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-navy-900 hover:shadow-lg transition-all text-center"
                >
                  <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-navy-900 transition-colors">
                    <Icono className="w-6 h-6 text-navy-700 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-navy-900 font-display group-hover:text-navy-700 transition-colors">
                    {esp.nombre}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TOP 3 RECOMENDADAS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-100 text-gold-800 rounded-full mb-4">
              <Award className="w-4 h-4" />
              <span className="text-sm font-semibold">Top 3 Recomendadas</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 font-display mb-4">
              Opticas Mejor Valoradas por OptiRank
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Seleccionadas por nuestro algoritmo OptiRank basado en calificacion, ubicacion,
              horarios y completitud de informacion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {top3.map((optica, index) => {
              const badge = badgesHumanos[index];
              const BadgeIcono = badge.icono;
              const imagenPrincipal = optica.fotos?.[0]?.url;
              const { abierta } = estaAbiertaEn(optica.horarios || []);
              const razonTexto = badge.razon(optica);

              return (
                <div key={optica.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col">
                  <Link href={`/opticas/${optica.slug || optica.id}`} className="block relative aspect-[4/3] bg-gray-200 overflow-hidden">
                    {imagenPrincipal ? (
                      <img src={imagenPrincipal} alt={optica.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-100 to-navy-200">
                        <MapPin className="w-16 h-16 text-navy-400" />
                      </div>
                    )}

                    <div className={`absolute top-4 left-4 right-4 ${badge.bgColor} border ${badge.borderColor} rounded-lg p-3 shadow-lg`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center flex-shrink-0`}>
                          <BadgeIcono className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${badge.textColor}`}>{badge.titulo}</p>
                          <p className="text-[10px] text-gray-600 truncate">{badge.subtitulo}</p>
                        </div>
                      </div>
                    </div>

                    {(optica.plan === "premium_plus" || optica.plan === "premium") && (
                      <div className="absolute top-4 right-4">
                        <span className={`px-2 py-1 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-sm ${optica.plan === "premium_plus" ? "bg-amber-500" : "bg-navy-900"}`}>
                          {optica.plan === "premium_plus" ? <Crown className="w-2.5 h-2.5" /> : <Star className="w-2.5 h-2.5" />}
                          {optica.plan === "premium_plus" ? "PREMIUM+" : "PREMIUM"}
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-6 flex-1 flex flex-col">
                    <Link href={`/opticas/${optica.slug || optica.id}`}>
                      <h3 className="font-bold text-navy-900 text-xl mb-2 font-display group-hover:text-navy-700 transition-colors">{optica.nombre}</h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" /> {optica.ciudad}{optica.estado ? `, ${optica.estado}` : ""}
                    </p>

                    <div className="mb-3">
                      <GoogleLiveBadge
                        nombre={optica.nombre}
                        calificacion={optica.calificacionGoogle}
                        numResenas={optica.numResenas}
                        urlGoogleMaps={optica.urlGoogleMaps}
                        onOpenMaps={() => setMapsModal({ isOpen: true, optica })}
                      />
                    </div>

                    {optica.especialidades && optica.especialidades.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {optica.especialidades.slice(0, 3).map((esp, i) => (
                          <span key={i} className="text-xs bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full font-medium">{esp}</span>
                        ))}
                      </div>
                    )}

                    {optica.descripcion && <p className="text-sm text-gray-600 line-clamp-2 mb-4">{optica.descripcion}</p>}

                    <div className={`mb-4 p-3 ${badge.bgColor} border ${badge.borderColor} rounded-lg mt-auto`}>
                      <p className="text-[11px] text-gray-700 italic flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-600" /> {razonTexto}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Link href={`/opticas/${optica.slug || optica.id}`} className="text-sm font-semibold text-navy-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ver ficha completa <ChevronRight className="w-4 h-4" />
                      </Link>
                      <div className="flex items-center gap-1">
                        {abierta ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Abierta
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Cerrada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/opticas" className="inline-flex items-center gap-2 px-8 py-4 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors shadow-lg">
              Ver todas las opticas <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <AdSlot slotId="home-between-1" />

      {/* ═══════════════════════════════════════════════════════════
          BENEFICIOS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-navy-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 font-display mb-4">Todo lo que necesitas en un solo lugar</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Herramientas poderosas para encontrar la optica ideal sin complicaciones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beneficios.map((beneficio, i) => {
              const Icono = beneficio.icono;
              return (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center mb-4">
                    <Icono className="w-6 h-6 text-navy-700" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-2">{beneficio.titulo}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{beneficio.descripcion}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          POR QUE LAS RECOMENDAMOS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-100 text-navy-800 rounded-full mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Tecnologia OptiRank</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 font-display mb-4">Por que las recomendamos</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nuestro sistema de ranking inteligente analiza multiples factores para mostrarte las mejores opciones segun lo que buscas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {razonesRecomendacion.map((razon, i) => {
              const Icono = razon.icono;
              return (
                <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-navy-900 to-navy-700 rounded-xl flex items-center justify-center mb-4">
                    <Icono className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-3">{razon.titulo}</h3>
                  <p className="text-gray-600 leading-relaxed">{razon.descripcion}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PLANES
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gold-50 via-white to-amber-50 border-y border-gold-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-100 text-gold-800 rounded-full mb-4">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-semibold">Haz crecer tu negocio</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 font-display mb-4">
              Planes flexibles y Multi-Sucursales
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Desde una unica optica hasta cadenas corporativas. Tenemos la solucion perfecta para escalar tu visibilidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">Plan Free</h3>
              <p className="text-3xl font-bold text-navy-900 mb-2">$0</p>
              <p className="text-sm text-gray-600">1 sucursal maxima. Presencia basica garantizada.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-navy-900 shadow-lg text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-navy-900 text-white text-[10px] px-3 py-1 rounded-bl-lg font-bold">POPULAR</div>
              <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-navy-700" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">Premium / Premium+</h3>
              <p className="text-3xl font-bold text-navy-900 mb-2">Hasta 3</p>
              <p className="text-sm text-gray-600">Sucursales maximas. Maxima visibilidad y herramientas de gestion.</p>
            </div>

            <div className="bg-navy-900 p-6 rounded-2xl border border-navy-800 shadow-lg text-center text-white">
              <div className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Corporativo</h3>
              <p className="text-3xl font-bold text-gold-400 mb-2">4+ Sucursales</p>
              <p className="text-sm text-navy-200">Tarifas preferenciales, facturacion consolidada y gestor dedicado.</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/registro"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl text-lg"
            >
              <Store className="w-5 h-5" />
              Consulta Planes y Beneficios Completos
            </Link>
            <p className="text-sm text-gray-500 mt-4">Sin compromisos. Cancela cuando quieras.</p>
          </div>
        </div>
      </section>

      <BannerPropio />

      {/* ═══════════════════════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Tienes una optica?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Unete al directorio mas completo de opticas en Mexico. Aumenta tu visibilidad y atrae mas clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-lg transition-all shadow-lg">
              <Sparkles className="w-5 h-5" /> Registra tu optica gratis
            </Link>
            <Link href="/opticas" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg transition-all border border-white/20">
              Explorar directorio <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <FooterPublico />
    </main>
  );
}