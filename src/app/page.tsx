"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Star, MapPin, ShieldCheck, Crown, Sparkles,
  TrendingUp, Clock, Search, Eye, MessageCircle,
  Phone, ChevronRight, Award, Heart, Users,
  CheckCircle2, ArrowRight, Zap, Target, Eye as EyeIcon,
  Building2, Globe
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useOptiRank } from "@/hooks/useOptiRank";
import { estaAbiertaEn } from "@/lib/ranking-engine";
import { Optica } from "@/types/optica";
import BannerDinamico from "@/components/BannerDinamico";
import { useUserLocation } from "@/hooks/useUserLocation";

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
  fotos?: Array<{ url: string }>;
  logo?: string;
  slug?: string;
  descripcion?: string;
  horarios?: Array<{ dia: string; apertura: string; cierre: string; cerrado: boolean }>;
  verificada?: boolean;
  whatsapp?: string;
  telefono?: string;
  urlGoogleMaps?: string;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE: Contador animado
// ─────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────
// COMPONENTE: Google Ad Placeholder
// ─────────────────────────────────────────────────────────────────

function GoogleAdBanner({ slot }: { slot: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="text-center py-2 bg-gray-100 border-b border-gray-200">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
            Publicidad
          </p>
        </div>
        <div className="min-h-[90px] flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Globe className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400">Espacio publicitario · Google Ads</p>
            <p className="text-[10px] text-gray-300 mt-1">Slot: {slot}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE: Banner propio elegante (fallback si no hay banner dinámico)
// ─────────────────────────────────────────────────────────────────

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
              <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1">
                Publicidad
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-navy-900 mb-2 font-display">
                ¿Eres proveedor de lentes o armazones?
              </h3>
              <p className="text-sm text-gray-700 max-w-xl">
                Llega a miles de ópticas en todo México. Anúnciate en el directorio líder del sector óptico y aumenta tus ventas.
              </p>
            </div>
          </div>
          <Link
            href="/contacto-publicidad"
            className="px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors flex-shrink-0 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            Conoce más
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [opticas, setOpticas] = useState<OpticaTop[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOpticas: 0, totalCiudades: 0, totalEspecialidades: 0 });
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
              id: doc.id,
              nombre,
              ciudad: data.ciudad,
              estado: data.estado,
              plan: data.plan || "free",
              calificacionGoogle: data.calificacionGoogle,
              numResenas: data.numResenas,
              especialidades: data.especialidades || [],
              fotos: data.fotos || [],
              logo: data.logo,
              slug: data.slug || doc.id,
              descripcion: data.descripcion,
              horarios: data.horarios || [],
              verificada: data.verificado || data.plan !== "free",
              whatsapp: data.whatsapp,
              telefono: data.telefono,
              urlGoogleMaps: data.urlGoogleMaps,
            } as OpticaTop);

            if (data.ciudad) ciudadesSet.add(data.ciudad);
            (data.especialidades || []).forEach((e: string) => especialidadesSet.add(e));
          }
        });

        setOpticas(opticasData);
        setStats({
          totalOpticas: opticasData.length,
          totalCiudades: ciudadesSet.size,
          totalEspecialidades: especialidadesSet.size,
        });
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
    contexto: {
      horaActual: new Date(),
      dispositivo: "desktop",
      sessionId: "home",
    },
    topRecomendadas: 3,
    autoTrack: false,
  });

  const top3 = opticasRanking.slice(0, 3);

  const badgesHumanos = [
    {
      titulo: "La más recomendada",
      subtitulo: "Elegida por nuestra comunidad",
      razon: (o: OpticaTop) => {
        const razones = [];
        if (o.calificacionGoogle) razones.push(`${o.calificacionGoogle}★`);
        const { abierta } = estaAbiertaEn(o.horarios || []);
        if (abierta) razones.push("abierta ahora");
        if (o.whatsapp) razones.push("WhatsApp activo");
        if (o.verificada) razones.push("verificada");
        return razones.length > 0 ? `Recomendada por: ${razones.join(", ")}` : "Recomendada por su ficha completa";
      },
      icono: Award,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-900",
      borderColor: "border-amber-200",
    },
    {
      titulo: "Calificación perfecta",
      subtitulo: "Excelencia comprobada",
      razon: (o: OpticaTop) => {
        const razones = [];
        if (o.calificacionGoogle) razones.push(`${o.calificacionGoogle}★`);
        const { abierta } = estaAbiertaEn(o.horarios || []);
        if (abierta) razones.push("abierta ahora");
        if (o.whatsapp) razones.push("WhatsApp activo");
        if (o.verificada) razones.push("verificada premium");
        return razones.length > 0 ? `Recomendada por: ${razones.join(", ")}` : "Recomendada por su ficha completa";
      },
      icono: Star,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-900",
      borderColor: "border-blue-200",
    },
    {
      titulo: "Experiencia garantizada",
      subtitulo: "Servicio de confianza",
      razon: (o: OpticaTop) => {
        const razones = [];
        if (o.calificacionGoogle) razones.push(`${o.calificacionGoogle}★`);
        const { abierta } = estaAbiertaEn(o.horarios || []);
        if (abierta) razones.push("abierta ahora");
        if (o.whatsapp) razones.push("WhatsApp activo");
        return razones.length > 0 ? `Recomendada por: ${razones.join(", ")}` : "Recomendada por su ficha completa";
      },
      icono: ShieldCheck,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-900",
      borderColor: "border-green-200",
    },
  ];

  const beneficios = [
    { icono: Search, titulo: "Encuentra rápido", descripcion: "Busca ópticas por ciudad, especialidad o seguro médico en segundos." },
    { icono: Star, titulo: "Reseñas reales", descripcion: "Opiniones verificadas de pacientes reales para tomar la mejor decisión." },
    { icono: MapPin, titulo: "Cerca de ti", descripcion: "Geolocalización inteligente para encontrar las ópticas más cercanas." },
    { icono: ShieldCheck, titulo: "Ópticas verificadas", descripcion: "Todas las ópticas premium están verificadas y actualizadas." },
    { icono: Clock, titulo: "Horarios en vivo", descripcion: "Sabe al instante si una óptica está abierta ahora mismo." },
    { icono: MessageCircle, titulo: "Contacto directo", descripcion: "WhatsApp, llamada o Waze con un solo clic." },
  ];

  const razonesRecomendacion = [
    { icono: Target, titulo: "Ranking inteligente", descripcion: "Nuestro algoritmo OptiRank analiza calificación, ubicación, horarios y completitud de ficha para recomendarte las mejores opciones." },
    { icono: Users, titulo: "Basado en tu perfil", descripcion: "Detectamos si buscas urgencia, planificación o exploración, y ajustamos el orden según lo que más te importa." },
    { icono: Heart, titulo: "Transparencia total", descripcion: "Mostramos reseñas reales de Google, horarios actualizados y toda la información que necesitas sin sorpresas." },
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
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="text-sm font-medium">El directorio #1 de ópticas en México</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 leading-tight">
              Encuentra la óptica
              <span className="block text-gold-400">perfecta cerca de ti</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Descubre ópticas verificadas con reseñas reales, horarios en vivo y contacto directo. 
              Tu próxima visita empieza aquí.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/opticas"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
                Explorar directorio
              </Link>
              <Link
                href="/login?redirect=/registro"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg transition-all border border-white/20"
              >
                <EyeIcon className="w-5 h-5" />
                Registra tu óptica
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <AnimatedCounter end={stats.totalOpticas} />
                <div className="text-sm text-gray-400 mt-1">Ópticas registradas</div>
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
        </div>
      </section>

      {/* TOP 3 ÓPTICAS RECOMENDADAS */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-100 text-gold-800 rounded-full mb-4">
              <Award className="w-4 h-4" />
              <span className="text-sm font-semibold">Top 3 Recomendadas</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 font-display mb-4">
              Las ópticas que más recomendamos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Seleccionadas por nuestro algoritmo OptiRank basado en calificación, ubicación, 
              horarios y completitud de información.
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
                <Link
                  key={optica.id}
                  href={`/opticas/${optica.slug || optica.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200"
                >
                  <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
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
                        <span className={`px-2 py-1 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-sm ${
                          optica.plan === "premium_plus" ? "bg-amber-500" : "bg-navy-900"
                        }`}>
                          {optica.plan === "premium_plus" ? <Crown className="w-2.5 h-2.5" /> : <Star className="w-2.5 h-2.5" />}
                          {optica.plan === "premium_plus" ? "PREMIUM+" : "PREMIUM"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-navy-900 text-xl mb-2 font-display group-hover:text-navy-700 transition-colors">
                      {optica.nombre}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {optica.ciudad}{optica.estado ? `, ${optica.estado}` : ""}
                    </p>

                    {optica.calificacionGoogle && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(optica.calificacionGoogle!) ? "text-amber-500 fill-current" : "text-gray-300"}`} />
                          ))}
                        </div>
                        <span className="font-bold text-navy-900">{optica.calificacionGoogle}</span>
                        <span className="text-sm text-gray-600">({optica.numResenas})</span>
                      </div>
                    )}

                    {optica.especialidades && optica.especialidades.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {optica.especialidades.slice(0, 3).map((esp, i) => (
                          <span key={i} className="text-xs bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full font-medium">{esp}</span>
                        ))}
                      </div>
                    )}

                    {optica.descripcion && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{optica.descripcion}</p>
                    )}

                    <div className={`mb-4 p-3 ${badge.bgColor} border ${badge.borderColor} rounded-lg`}>
                      <p className="text-[11px] text-gray-700 italic flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-600" />
                        {razonTexto}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm font-semibold text-navy-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ver ficha completa
                        <ChevronRight className="w-4 h-4" />
                      </span>
                      <div className="flex items-center gap-1">
                        {abierta ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Abierta
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Cerrada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/opticas"
              className="inline-flex items-center gap-2 px-8 py-4 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              Ver todas las ópticas
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* POR QUÉ LA RECOMENDAMOS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-100 text-navy-800 rounded-full mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Tecnología OptiRank</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 font-display mb-4">
              Por qué las recomendamos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nuestro sistema de ranking inteligente analiza múltiples factores para mostrarte 
              las mejores opciones según lo que buscas.
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

      {/* 📍 GOOGLE ADS - Entre secciones */}
      <GoogleAdBanner slot="home-between-1" />

      {/* BENEFICIOS */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-navy-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 font-display mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Herramientas poderosas para encontrar la óptica ideal sin complicaciones.
            </p>
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

      {/* 📍 BANNER DINÁMICO - Antes del CTA final */}
      <BannerDinamico ubicacion="home-footer" />

      {/* CTA FINAL */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            ¿Tienes una óptica?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Únete al directorio más completo de ópticas en México. 
            Aumenta tu visibilidad y atrae más clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login?redirect=/registro"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-lg transition-all shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Registra tu óptica gratis
            </Link>
            <Link
              href="/opticas"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg transition-all border border-white/20"
            >
              Explorar directorio
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}