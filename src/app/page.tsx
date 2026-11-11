"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Star, MapPin, ShieldCheck, Crown, Sparkles,
  Search, Eye, MessageCircle,
  ChevronRight, Award, Users,
  CheckCircle2, ArrowRight, Zap, Target,
  Building2, Store, Glasses, ScanEye, Baby,
  Contact, EyeOff, Loader2, X, Sun
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
}

interface FranklinMessage {
  id: number;
  text: string;
  type: "thinking" | "success";
}

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

// NUEVAS 6 ESPECIALIDADES GLOBALES
const ESPECIALIDADES = [
  { nombre: "Optometria General", icono: Eye, slug: "optometria" },
  { nombre: "Lentes de Contacto", icono: Contact, slug: "contactologia" },
  { nombre: "Lentes Progresivos", icono: Glasses, slug: "progresivos" },
  { nombre: "Lentes Antiblue", icono: Sun, slug: "antiblue" },
  { nombre: "Examen de la Vista", icono: ScanEye, slug: "examen-vista" },
  { nombre: "Lentes Solares", icono: EyeOff, slug: "lentes-solares" },
];

export default function HomePage() {
  const [opticas, setOpticas] = useState<OpticaTop[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOpticas: 0, totalCiudades: 0, totalEspecialidades: 0 });
  const [franklinQuery, setFranklinQuery] = useState("");
  const [franklinState, setFranklinState] = useState<"idle" | "thinking" | "done">("idle");
  const [franklinMessages, setFranklinMessages] = useState<FranklinMessage[]>([]);
  const [franklinResults, setFranklinResults] = useState<OpticaTop[]>([]);
  const [franklinSummary, setFranklinSummary] = useState("");
  const [mapsModal, setMapsModal] = useState<{ isOpen: boolean; optica: OpticaTop | null }>({ isOpen: false, optica: null });
  const resultsRef = useRef<HTMLDivElement>(null);
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
              slug: data.slug || doc.id, descripcion: data.descripcion, horarios: data.horarios || [],
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

  const procesarConsultaFranklin = async () => {
    if (!franklinQuery.trim() || franklinState === "thinking") return;

    setFranklinState("thinking");
    setFranklinMessages([]);
    setFranklinResults([]);
    setFranklinSummary("");

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    const addStreamingMessage = async (text: string) => {
      const msgId = Date.now() + Math.random();
      setFranklinMessages((prev) => [...prev, { id: msgId, text, type: "thinking" }]);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setFranklinMessages((prev) =>
        prev.map(m => m.id === msgId ? { ...m, type: "success" } : m)
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
    };

    try {
      const response = await fetch('/api/franklin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: franklinQuery }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error en la busqueda");
      }

      const aiData = result.data;
      const { ciudad, especialidad, seguro } = aiData.filtros;

      for (const paso of aiData.pasos_pensamiento) {
        await addStreamingMessage(paso);
      }

      let resultadosFiltrados = [...opticas];
      let hayCoincidenciasExactas = true;
      let hayCoincidenciaEspecialidad = false;

      // 1. FILTRADO POR CIUDAD
      if (ciudad) {
        const ciudadLower = ciudad.toLowerCase();
        const antes = resultadosFiltrados.length;
        
        resultadosFiltrados = resultadosFiltrados.filter((o) => {
          const ciudadOptica = (o.ciudad || "").toLowerCase();
          const estadoOptica = (o.estado || "").toLowerCase();
          return ciudadOptica.includes(ciudadLower) || 
                 estadoOptica.includes(ciudadLower) ||
                 ciudadLower.includes(ciudadOptica);
        });
        
        if (resultadosFiltrados.length === 0 && antes > 0) {
          hayCoincidenciasExactas = false;
          await addStreamingMessage(`No encontramos opticas en ${ciudad}, mostrando opciones cercanas...`);
          resultadosFiltrados = [...opticas];
        }
      }

      // 2. FILTRADO POR ESPECIALIDAD (MEJORADO)
      if (especialidad) {
        const espLower = especialidad.toLowerCase().trim();
        const antes = resultadosFiltrados.length;
        
        // Dividir en palabras clave (ignorar palabras cortas como "de", "la", "el")
        const palabrasIgnorar = ["de", "la", "el", "los", "las", "un", "una", "y", "o"];
        const palabrasClave = espLower.split(/\s+/).filter(p => p.length > 2 && !palabrasIgnorar.includes(p));
        
        // Si no hay palabras clave utiles, usar toda la frase
        const terminosBusqueda = palabrasClave.length > 0 ? palabrasClave : [espLower];
        
        resultadosFiltrados = resultadosFiltrados.filter((o) => {
          // Buscar en especialidades genéricas
          const coincideGenerica = (o.especialidades || []).some((e: string) => {
            const espNormalizada = e.toLowerCase();
            return terminosBusqueda.some(termino => espNormalizada.includes(termino));
          });
          
          // Buscar en especialidades personalizadas
          const coincidePersonalizada = (o.especialidadesPersonalizadas || []).some((e: string) => {
            const espNormalizada = e.toLowerCase();
            return terminosBusqueda.some(termino => espNormalizada.includes(termino));
          });
          
          if (coincideGenerica || coincidePersonalizada) {
            hayCoincidenciaEspecialidad = true;
            return true;
          }
          return false;
        });

        if (resultadosFiltrados.length === 0 && antes > 0) {
          hayCoincidenciasExactas = false;
          await addStreamingMessage(`No encontramos opticas con "${especialidad}", mostrando opciones disponibles...`);
          resultadosFiltrados = [...opticas];
        }
      }

      // 3. FILTRADO POR SEGURO
      if (seguro) {
        const seguroLower = seguro.toLowerCase();
        resultadosFiltrados = resultadosFiltrados.filter((o) =>
          (o.segurosAceptados || []).some((s: string) => s.toLowerCase().includes(seguroLower))
        );
      }

      // 4. ORDENAMIENTO INTELIGENTE (SCORING MEJORADO)
      if (especialidad || ciudad) {
        resultadosFiltrados.sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;

          // Ventaja por Plan
          if (a.plan === 'premium_plus') scoreA += 30;
          else if (a.plan === 'premium') scoreA += 20;
          if (b.plan === 'premium_plus') scoreB += 30;
          else if (b.plan === 'premium') scoreB += 20;

          // Ventaja por coincidencia en especialidad
          if (especialidad) {
            const espLower = especialidad.toLowerCase();
            const palabrasIgnorar = ["de", "la", "el", "los", "las", "un", "una", "y", "o"];
            const terminosBusqueda = espLower.split(/\s+/).filter(p => p.length > 2 && !palabrasIgnorar.includes(p));
            const terminos = terminosBusqueda.length > 0 ? terminosBusqueda : [espLower];

            // Coincidencia en especialidad personalizada (peso muy alto: +50)
            const aTienePersonalizada = (a.especialidadesPersonalizadas || []).some((e: string) => {
              const espNorm = e.toLowerCase();
              return terminos.some(t => espNorm.includes(t));
            });
            const bTienePersonalizada = (b.especialidadesPersonalizadas || []).some((e: string) => {
              const espNorm = e.toLowerCase();
              return terminos.some(t => espNorm.includes(t));
            });
            
            if (aTienePersonalizada) scoreA += 50;
            if (bTienePersonalizada) scoreB += 50;

            // Coincidencia en especialidad generica (peso medio: +20)
            const aTieneGenerica = (a.especialidades || []).some((e: string) => {
              const espNorm = e.toLowerCase();
              return terminos.some(t => espNorm.includes(t));
            });
            const bTieneGenerica = (b.especialidades || []).some((e: string) => {
              const espNorm = e.toLowerCase();
              return terminos.some(t => espNorm.includes(t));
            });

            if (aTieneGenerica && !aTienePersonalizada) scoreA += 20;
            if (bTieneGenerica && !bTienePersonalizada) scoreB += 20;
          }

          // Desempate por calificacion de Google
          scoreA += (a.calificacionGoogle || 0) * 2;
          scoreB += (b.calificacionGoogle || 0) * 2;

          return scoreB - scoreA;
        });
      }

      if (resultadosFiltrados.length === 0) {
        await addStreamingMessage("No encontramos opticas que coincidan con tu busqueda. Te mostramos las mejores opciones disponibles.");
        resultadosFiltrados = opticasRanking.slice(0, 3);
      } else {
        resultadosFiltrados = resultadosFiltrados.slice(0, 6);
      }

      // Mensaje final inteligente
      let resumenFinal = aiData.mensaje_final;
      if (!hayCoincidenciasExactas) {
        resumenFinal = `No encontramos coincidencias exactas, pero estas son las mejores opciones disponibles en ${ciudad || 'tu zona'}.`;
      } else if (hayCoincidenciaEspecialidad) {
        resumenFinal = `Encontre opticas con experiencia en ${especialidad}. Estas son las mejores opciones:`;
      }

      setFranklinResults(resultadosFiltrados);
      setFranklinSummary(resumenFinal);
      setFranklinState("done");

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);

    } catch (error) {
      console.error("Error en Franklin:", error);
      await addStreamingMessage("Hubo un problema procesando tu busqueda. Por favor, intenta de nuevo.");
      setFranklinState("done");
    }
  };

  const resetFranklin = () => {
    setFranklinState("idle");
    setFranklinMessages([]);
    setFranklinResults([]);
    setFranklinSummary("");
    setFranklinQuery("");
  };

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
    { icono: Search, titulo: "Encuentra rapido", descripcion: "Busca opticas por ciudad, especialidad o seguro medico en segundos." },
    { icono: Star, titulo: "Resenas reales", descripcion: "Opiniones verificadas de pacientes reales para tomar la mejor decision." },
    { icono: MapPin, titulo: "Cerca de ti", descripcion: "Geolocalizacion inteligente para encontrar las opticas mas cercanas." },
    { icono: ShieldCheck, titulo: "Opticas verificadas", descripcion: "Todas las opticas premium estan verificadas y actualizadas." },
    { icono: ChevronRight, titulo: "Horarios en vivo", descripcion: "Sabe al instante si una optica esta abierta ahora mismo." },
    { icono: MessageCircle, titulo: "Contacto directo", descripcion: "WhatsApp, llamada o Waze con un solo clic." },
  ];

  const razonesRecomendacion = [
    { icono: Target, titulo: "Ranking inteligente", descripcion: "Nuestro algoritmo OptiRank analiza calificacion, ubicacion, horarios y completitud de ficha para recomendarte las mejores opciones." },
    { icono: Users, titulo: "Basado en tu perfil", descripcion: "Detectamos si buscas urgencia, planificacion o exploracion, y ajustamos el orden segun lo que mas te importa." },
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

      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white overflow-hidden pt-20 pb-28 md:pt-32 md:pb-36">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium">El directorio #1 de opticas en Mexico</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 leading-tight">
            Directorio de Opticas en Mexico:
            <span className="block text-gold-400 mt-2">Encuentra tu especialista visual cerca de ti</span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Resenas reales, horarios en vivo y contacto directo. Tu proxima visita empieza aqui.
          </p>

          <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 md:p-3 border border-gray-200">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold-400 to-amber-500 rounded-full animate-ping opacity-40"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-gold-400 via-amber-400 to-gold-600 rounded-full flex items-center justify-center shadow-lg shadow-gold-400/50 animate-pulse">
                    <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <p className="text-base font-bold text-navy-900 font-display">
                    Franklin <span className="text-xs font-normal text-gray-500">AI</span>
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Tecnologia impulsada por Qwen AI
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={franklinQuery}
                    onChange={(e) => setFranklinQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") procesarConsultaFranklin();
                    }}
                    placeholder="Ej: 'Necesito una optica en Cuautitlan que acepte GNP...'"
                    className="w-full h-14 md:h-12 px-4 text-gray-800 placeholder-gray-400 bg-gray-50 md:bg-transparent border border-gray-200 md:border-0 rounded-xl md:rounded-none focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-base"
                  />
                </div>

                <button
                  onClick={procesarConsultaFranklin}
                  disabled={franklinState === "thinking" || !franklinQuery.trim()}
                  className="w-full md:w-auto h-14 md:h-12 px-6 bg-navy-900 hover:bg-navy-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                >
                  {franklinState === "thinking" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Busqueda Inteligente</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Prueba decir:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFranklinQuery("Optica con buen precio en CDMX")}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-navy-800 px-3 py-2 rounded-full transition-colors whitespace-nowrap"
                  >
                    "Optica con buen precio en CDMX"
                  </button>
                  <button
                    onClick={() => setFranklinQuery("Especialista en lentes de contacto")}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-navy-800 px-3 py-2 rounded-full transition-colors whitespace-nowrap"
                  >
                    "Especialista en lentes de contacto"
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-2xl mx-auto border-t border-white/10 pt-8">
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

      {(franklinState === "thinking" || franklinState === "done") && (
        <section ref={resultsRef} className="py-16 bg-gradient-to-br from-gold-50 to-white border-b border-gold-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-400 to-amber-500 rounded-full animate-ping opacity-30"></div>
                    <div className="relative w-10 h-10 bg-gradient-to-br from-gold-400 via-amber-400 to-gold-600 rounded-full flex items-center justify-center shadow-lg shadow-gold-400/50 animate-pulse">
                      <Sparkles className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold font-display">Franklin</p>
                    <p className="text-xs text-gray-300">Impulsado por Qwen AI</p>
                  </div>
                </div>
                {franklinState === "done" && (
                  <button
                    onClick={resetFranklin}
                    className="text-gray-300 hover:text-white transition-colors"
                    title="Nueva busqueda"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="p-6 space-y-3 min-h-[120px]">
                {franklinMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 transition-all duration-500 ${
                      msg.type === "success"
                        ? "bg-green-50 border border-green-200 rounded-lg p-3"
                        : "py-1"
                    }`}
                    style={{ animation: "fadeIn 0.4s ease-out" }}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        msg.type === "success"
                          ? "bg-green-500 scale-100"
                          : "bg-navy-100 scale-95"
                      }`}
                    >
                      {msg.type === "thinking" ? (
                        <Loader2 className="w-4 h-4 text-navy-700 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <p
                      className={`text-sm transition-all duration-300 ${
                        msg.type === "success"
                          ? "text-green-900 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              {franklinState === "done" && franklinResults.length > 0 && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-navy-900 font-display">{franklinSummary}</h3>
                    <Link
                      href="/opticas"
                      className="text-sm text-navy-700 hover:text-navy-900 font-semibold flex items-center gap-1"
                    >
                      Ver todas <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {franklinResults.slice(0, 3).map((optica) => {
                      const { abierta } = estaAbiertaEn(optica.horarios || []);
                      const imagen = optica.fotos?.[0]?.url;
                      return (
                        <Link
                          key={optica.id}
                          href={`/opticas/${optica.slug || optica.id}`}
                          className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                        >
                          <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                            {imagen ? (
                              <img src={imagen} alt={optica.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-100 to-navy-200">
                                <MapPin className="w-10 h-10 text-navy-400" />
                              </div>
                            )}
                            {(optica.plan === "premium_plus" || optica.plan === "premium") && (
                              <div className="absolute top-2 right-2">
                                <span className={`px-2 py-0.5 text-white text-[9px] font-bold rounded-full ${optica.plan === "premium_plus" ? "bg-amber-500" : "bg-navy-900"}`}>
                                  {optica.plan === "premium_plus" ? "PREMIUM+" : "PREMIUM"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-navy-900 text-sm mb-1 line-clamp-1">{optica.nombre}</h4>
                            <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {optica.ciudad}{optica.estado ? `, ${optica.estado}` : ""}
                            </p>
                            {optica.calificacionGoogle && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                <span className="text-xs font-bold text-navy-900">{optica.calificacionGoogle}</span>
                                <span className="text-xs text-gray-500">({optica.numResenas})</span>
                              </div>
                            )}
                            <div className="mt-2">
                              {abierta ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Abierta
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-semibold rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Cerrada
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {franklinResults.length > 3 && (
                    <div className="mt-4 text-center">
                      <Link
                        href="/opticas"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors shadow-md"
                      >
                        Ver las {franklinResults.length} opticas encontradas
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

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