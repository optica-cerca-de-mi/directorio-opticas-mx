"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star, MapPin, Phone, MessageCircle, Globe, Clock,
  ArrowLeft, ShieldCheck, ExternalLink, Loader2,
  ChevronRight, Calendar, Navigation, Tag, TrendingUp,
  HelpCircle, Megaphone, Image as ImageIcon, Video,
  Play, ChevronDown
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPlanConfig, PlanType } from "@/lib/plans-config";
import JsonLdOptica from '@/components/SEO/JsonLdOptica';

// ✅ Helper para obtener URL embed de YouTube/Vimeo
function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }
  if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  }
  return null;
}

interface OpticaData {
  id: string;
  nombre: string;
  nombreComercial?: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  linkAgenda?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  cp?: string;
  plan?: PlanType;
  calificacionGoogle?: number;
  numResenas?: number;
  urlGoogleMaps?: string;
  sitioWeb?: string;
  especialidades?: string[];
  segurosAceptados?: string[];
  horarios?: Array<{
    dia: string;
    apertura: string;
    cierre: string;
    cerrado: boolean;
  }>;
  descripcion?: string;
  resenasGoogle?: {
    calificacion: number;
    totalResenas: number;
    urlPerfil: string;
    ultimasResenas: Array<{
      autor: string;
      calificacion: number;
      fecha: string;
      texto: string;
    }>;
  };
  verificada?: boolean;
  fechaRegistro?: string;
  fotos?: Array<{ url: string; caption?: string }>;
  videos?: string[];
  videoCloudinary?: string;
  hero?: {
    imagen: string;
    colorOverlay: string;
    titulo: string;
    subtitulo: string;
  };
  logo?: string;
  facebook?: string;
  instagram?: string;
  productosDestacados?: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    imagen: string;
    precio?: string;
    link?: string;
  }>;
  promociones?: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    fechaInicio?: string;
    fechaFin?: string;
    activa: boolean;
  }>;
  bloquesContenido?: Array<{
    id: string;
    tipo: 'texto' | 'imagen_texto' | 'video' | 'faq' | 'galeria' | 'banner';
    orden: number;
    datos: {
      titulo?: string;
      contenido?: string;
      imagen?: string;
      videoUrl?: string;
      layout?: 'izquierda' | 'derecha' | 'centro';
      preguntas?: Array<{ pregunta: string; respuesta: string }>;
      imagenes?: string[];
      ctaText?: string;
      ctaLink?: string;
      colorFondo?: string;
      colorTexto?: string;
    };
  }>;
}

// ────────────────────────────────────────────────────────────────────────────────
// COMPONENTES DE BLOQUES DE CONTENIDO
// ────────────────────────────────────────────────────────────────────────────────

function BloqueTexto({ datos }: { datos: any }) {
  return (
    <div className="prose prose-lg max-w-none">
      {datos.titulo && <h2 className="text-3xl font-bold text-navy-900 mb-4">{datos.titulo}</h2>}
      <div dangerouslySetInnerHTML={{ __html: datos.contenido || '' }} />
    </div>
  );
}

function BloqueImagenTexto({ datos }: { datos: any }) {
  const layoutClass = datos.layout === 'derecha' ? 'flex-row-reverse' : 'flex-row';
  return (
    <div className={`flex ${layoutClass} gap-8 items-center`}>
      {datos.imagen && (
        <div className="w-1/2">
          <img src={datos.imagen} alt={datos.titulo || ''} className="w-full h-auto rounded-xl shadow-lg" />
        </div>
      )}
      <div className="w-1/2">
        {datos.titulo && <h2 className="text-3xl font-bold text-navy-900 mb-4">{datos.titulo}</h2>}
        <div dangerouslySetInnerHTML={{ __html: datos.contenido || '' }} />
      </div>
    </div>
  );
}

function BloqueVideo({ datos }: { datos: any }) {
  const embedUrl = getVideoEmbedUrl(datos.videoUrl || '');
  return (
    <div>
      {datos.titulo && <h2 className="text-3xl font-bold text-navy-900 mb-4">{datos.titulo}</h2>}
      {embedUrl && (
        <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
          <iframe src={embedUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      )}
    </div>
  );
}

function BloqueFAQ({ datos }: { datos: any }) {
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(null);
  return (
    <div>
      {datos.titulo && <h2 className="text-3xl font-bold text-navy-900 mb-6">{datos.titulo}</h2>}
      <div className="space-y-3">
        {(datos.preguntas || []).map((pq: any, i: number) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setPreguntaAbierta(preguntaAbierta === i ? null : i)} className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors">
              <span className="font-semibold text-navy-900">{pq.pregunta}</span>
              <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${preguntaAbierta === i ? 'rotate-180' : ''}`} />
            </button>
            {preguntaAbierta === i && (
              <div className="px-6 py-4 bg-white">
                <p className="text-gray-700">{pq.respuesta}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BloqueGaleria({ datos }: { datos: any }) {
  return (
    <div>
      {datos.titulo && <h2 className="text-3xl font-bold text-navy-900 mb-6">{datos.titulo}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(datos.imagenes || []).map((img: string, i: number) => (
          <div key={i} className="aspect-square rounded-lg overflow-hidden shadow-md">
            <img src={img} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BloqueBanner({ datos }: { datos: any }) {
  return (
    <div className="rounded-xl p-8 text-center" style={{ backgroundColor: datos.colorFondo || '#1e3a8a', color: datos.colorTexto || '#ffffff' }}>
      {datos.titulo && <h2 className="text-2xl font-bold mb-3">{datos.titulo}</h2>}
      <div dangerouslySetInnerHTML={{ __html: datos.contenido || '' }} />
      {datos.ctaText && (
        <a href={datos.ctaLink || '#'} className="inline-block mt-4 px-6 py-3 bg-white text-navy-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors" style={{ color: datos.colorFondo || '#1e3a8a' }}>
          {datos.ctaText}
        </a>
      )}
    </div>
  );
}

function BloqueContenidoRenderer({ bloque }: { bloque: any }) {
  switch (bloque.tipo) {
    case 'texto': return <BloqueTexto datos={bloque.datos} />;
    case 'imagen_texto': return <BloqueImagenTexto datos={bloque.datos} />;
    case 'video': return <BloqueVideo datos={bloque.datos} />;
    case 'faq': return <BloqueFAQ datos={bloque.datos} />;
    case 'galeria': return <BloqueGaleria datos={bloque.datos} />;
    case 'banner': return <BloqueBanner datos={bloque.datos} />;
    default: return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// FUNCIÓN HELPER: Transformar URL de Google Maps a embed
// ────────────────────────────────────────────────────────────────────────────────

function getGoogleMapsEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    if (url.includes('/embed')) return url;
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      return `https://maps.google.com/maps?q=${coordsMatch[1]},${coordsMatch[2]}&output=embed`;
    }
    const queryMatch = url.match(/[?&]q=([^&]+)/);
    if (queryMatch) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(queryMatch[1]))}&output=embed`;
    }
    const placeMatch = url.match(/\/place\/([^/@]+)/);
    if (placeMatch) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')))}&output=embed`;
    }
    return null;
  } catch (error) {
    console.error('Error transformando URL de Google Maps:', error);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────────

export default function FichaOptica() {
  const params = useParams();
  const router = useRouter();
  const [optica, setOptica] = useState<OpticaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarOptica = async () => {
      if (!params.id) return;
      try {
        const docRef = doc(db, "opticas", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOptica({
            id: docSnap.id,
            ...data,
            nombre: data.nombre || data.nombreComercial || "Óptica"
          } as OpticaData);
        } else {
          setError("Óptica no encontrada");
        }
      } catch (err) {
        console.error("Error al cargar óptica:", err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    cargarOptica();
  }, [params.id]);

  const estaAbiertaAhora = () => {
    if (!optica?.horarios) return null;
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const diaHoy = diasSemana[new Date().getDay()];
    const horario = optica.horarios.find(h => h.dia === diaHoy);
    if (!horario || horario.cerrado) return { abierta: false, texto: "Cerrado hoy" };
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    const [hApertura, mApertura] = horario.apertura.split(":").map(Number);
    const [hCierre, mCierre] = horario.cierre.split(":").map(Number);
    const aperturaMin = hApertura * 60 + mApertura;
    const cierreMin = hCierre * 60 + mCierre;
    if (horaActual < aperturaMin || horaActual > cierreMin) {
      return { abierta: false, texto: `Cierra a las ${horario.cierre}` };
    }
    return { abierta: true, texto: `Abierto - Cierra a las ${horario.cierre}` };
  };

  const estadoHorario = estaAbiertaAhora();
  const planConfig = optica?.plan ? getPlanConfig(optica.plan as PlanType) : null;
  const nombreMostrar = optica?.nombre || optica?.nombreComercial || "Óptica";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-navy-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando ficha de la óptica...</p>
        </div>
      </div>
    );
  }

  if (error || !optica) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">{error || "Óptica no encontrada"}</p>
          <Link href="/opticas" className="text-navy-700 font-semibold hover:underline">← Volver al directorio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ JSON-LD Schema.org para SEO (OptiBoost Pilar 3) */}
      <JsonLdOptica
        nombre={nombreMostrar}
        descripcion={optica.descripcion}
        telefono={optica.telefono}
        whatsapp={optica.whatsapp}
        email={optica.email}
        sitioWeb={optica.sitioWeb}
        direccion={optica.direccion}
        ciudad={optica.ciudad}
        estado={optica.estado}
        cp={optica.cp}
        horarios={optica.horarios}
        calificacionGoogle={optica.calificacionGoogle}
        numResenas={optica.numResenas}
        fotos={optica.fotos}
        logo={optica.logo}
        facebook={optica.facebook}
        instagram={optica.instagram}
        especialidades={optica.especialidades}
        urlGoogleMaps={optica.urlGoogleMaps}
      />

      {/* Header con navegación */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-600 hover:text-navy-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al directorio
          </button>
        </div>
      </div>

      {/* Hero personalizado (si existe) */}
      {optica.hero?.imagen && (
        <section className="relative h-[500px] overflow-hidden">
          <img src={optica.hero.imagen} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: optica.hero.colorOverlay || '#000000', opacity: 0.6 }} />
          <div className="relative z-10 h-full flex items-center justify-center px-4">
            <div className="text-center text-white max-w-4xl">
              {optica.hero.titulo && <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">{optica.hero.titulo}</h1>}
              {optica.hero.subtitulo && <p className="text-xl md:text-2xl drop-shadow-md">{optica.hero.subtitulo}</p>}
            </div>
          </div>
        </section>
      )}

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna principal (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Información básica */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              {optica.logo && (
                <div className="mb-6">
                  <img src={optica.logo} alt={`Logo de ${nombreMostrar}`} className="w-24 h-24 object-contain rounded-lg border border-gray-200" />
                </div>
              )}

              {planConfig?.limites.badgePremium && (
                <div className="mb-4">
                  {optica.plan === "premium_plus" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" /> Óptica verificada Premium+
                    </span>
                  ) : optica.plan === "premium" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" /> Óptica verificada Premium
                    </span>
                  ) : null}
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-bold text-navy-900 font-display mb-4">{nombreMostrar}</h1>

              {optica.calificacionGoogle && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-6 h-6 ${i < Math.floor(optica.calificacionGoogle!) ? "text-amber-500 fill-current" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-navy-900">{optica.calificacionGoogle}</span>
                  <span className="text-gray-600">({optica.numResenas} reseñas de Google)</span>
                </div>
              )}

              {estadoHorario && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6 ${estadoHorario.abierta ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">{estadoHorario.texto}</span>
                </div>
              )}

              {optica.direccion && (
                <div className="flex items-start gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">{optica.direccion}</p>
                    {optica.ciudad && optica.estado && (
                      <p className="text-gray-600 text-sm">{optica.ciudad}, {optica.estado}{optica.cp ? ` ${optica.cp}` : ""}</p>
                    )}
                  </div>
                </div>
              )}

              {optica.descripcion && planConfig?.limites.maxCaracteresDescripcion > 0 && (
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">{optica.descripcion}</p>
                </div>
              )}

              {/* Redes sociales */}
              {(optica.facebook || optica.instagram) && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Síguenos en:</p>
                  <div className="flex gap-3">
                    {optica.facebook && (
                      <a href={optica.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" aria-label="Facebook">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                    )}
                    {optica.instagram && (
                      <a href={optica.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white rounded-lg flex items-center justify-center hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 transition-colors" aria-label="Instagram">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* ✅ SECCIÓN DE AGENDA MEJORADA */}
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-navy-700" /> Agendar Cita
                </p>
                <div className={`grid gap-3 ${optica.linkAgenda ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                  {planConfig?.limites.incluyeBotonWhatsApp && optica.whatsapp && (
                    <a href={`https://wa.me/52${optica.whatsapp}?text=${encodeURIComponent("Hola, vi su óptica en el directorio y me gustaría agendar una cita para un examen de la vista.")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-sm">
                      <MessageCircle className="w-4 h-4" /> Agendar por WhatsApp
                    </a>
                  )}
                  {optica.linkAgenda && (
                    <a href={optica.linkAgenda} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 bg-navy-900 hover:bg-navy-800 text-white rounded-lg font-semibold transition-colors shadow-sm">
                      <Calendar className="w-4 h-4" /> Reservar en línea
                    </a>
                  )}
                </div>
              </div>

              {/* Resto de botones de contacto */}
              <div className={`grid gap-3 pt-4 border-t border-gray-100 ${planConfig?.limites.incluyeBotonWaze ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"}`}>
                {planConfig?.limites.incluyeBotonLlamar && optica.telefono && (
                  <a href={`tel:${optica.telefono.replace(/\s/g, "")}`} className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                    <Phone className="w-4 h-4" /> Llamar
                  </a>
                )}
                {planConfig?.limites.incluyeBotonWaze && optica.direccion && (
                  <a href={`https://waze.com/ul?q=${encodeURIComponent(optica.direccion)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors">
                    <Navigation className="w-4 h-4" /> Waze
                  </a>
                )}
                {planConfig?.limites.incluyeBotonMaps && optica.urlGoogleMaps && (
                  <a href={optica.urlGoogleMaps} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors">
                    <ExternalLink className="w-4 h-4" /> Maps
                  </a>
                )}
                {planConfig?.limites.incluyeBotonSitioWeb && optica.sitioWeb && (
                  <a href={optica.sitioWeb.startsWith('http') ? optica.sitioWeb : `https://${optica.sitioWeb}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors">
                    <Globe className="w-4 h-4" /> Sitio web
                  </a>
                )}
              </div>
            </div>

            {/* SECCIÓN: CONTENIDO ENRIQUECIDO */}
            {optica.bloquesContenido && optica.bloquesContenido.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-12">
                {optica.bloquesContenido.sort((a, b) => a.orden - b.orden).map((bloque) => (
                  <div key={bloque.id} className="border-b border-gray-100 pb-12 last:border-0 last:pb-0">
                    <BloqueContenidoRenderer bloque={bloque} />
                  </div>
                ))}
              </div>
            )}

            {/* SECCIÓN DE VIDEOS */}
            {(optica.videos?.length > 0 || optica.videoCloudinary) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-navy-900 font-display mb-6 flex items-center gap-2">
                  <Video className="w-6 h-6" /> Videos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {optica.videos?.map((videoUrl, i) => {
                    const embedUrl = getVideoEmbedUrl(videoUrl);
                    if (!embedUrl) return null;
                    return (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                        <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={`Video ${i + 1}`} />
                      </div>
                    );
                  })}
                  {optica.videoCloudinary && typeof optica.videoCloudinary === 'object' && 'url' in optica.videoCloudinary && (
                    <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                      <video src={optica.videoCloudinary.url} controls className="w-full h-full" poster={optica.fotos?.[0]?.url} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mapa de Google Maps con fallback */}
            {optica.urlGoogleMaps && (() => {
              const embedUrl = getGoogleMapsEmbedUrl(optica.urlGoogleMaps);
              return (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-navy-900 font-display mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6" /> Ubicación
                  </h2>
                  {embedUrl ? (
                    <div className="aspect-video rounded-xl overflow-hidden border border-gray-200">
                      <iframe src={embedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Mapa de ${nombreMostrar}`} />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                      <div className="text-center p-6">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-700 font-semibold mb-2">No se puede mostrar el mapa</p>
                        <p className="text-sm text-gray-500 mb-4">La URL de Google Maps no es compatible con vista embebida</p>
                        <a href={optica.urlGoogleMaps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors">
                          <ExternalLink className="w-4 h-4" /> Ver en Google Maps
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Galería de fotos */}
            {planConfig && planConfig.limites.maxFotos > 0 && optica.fotos && optica.fotos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-navy-900 font-display mb-6 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6" /> Galería de fotos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {optica.fotos.slice(0, planConfig.limites.maxFotos).map((foto, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img src={foto.url} alt={foto.caption || `Foto ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      {foto.caption && <p className="text-xs text-gray-600 mt-2 px-2">{foto.caption}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Productos destacados */}
            {optica.productosDestacados && optica.productosDestacados.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-navy-900 font-display mb-6 flex items-center gap-2">
                  <Tag className="w-6 h-6" /> Productos destacados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {optica.productosDestacados.map((producto) => (
                    <div key={producto.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      {producto.imagen && (
                        <div className="aspect-square bg-gray-100">
                          <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-navy-900 mb-2">{producto.nombre}</h3>
                        <p className="text-sm text-gray-600 mb-3">{producto.descripcion}</p>
                        {producto.precio && <p className="text-lg font-bold text-navy-900 mb-3">{producto.precio}</p>}
                        {producto.link && (
                          <a href={producto.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-navy-700 font-semibold hover:underline">
                            Ver más <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Promociones */}
            {optica.promociones && optica.promociones.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-navy-900 font-display mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" /> Promociones y ofertas
                </h2>
                <div className="space-y-4">
                  {optica.promociones.map((promo) => (
                    <div key={promo.id} className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-amber-900 mb-2">{promo.titulo}</h3>
                      <p className="text-gray-700 mb-3">{promo.descripcion}</p>
                      {promo.fechaInicio && <p className="text-xs text-amber-700">Desde: {new Date(promo.fechaInicio).toLocaleDateString('es-MX')}</p>}
                      {promo.fechaFin && <p className="text-xs text-amber-700">Hasta: {new Date(promo.fechaFin).toLocaleDateString('es-MX')}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reseñas de Google */}
            {planConfig?.limites.muestraResenasGoogle && optica.resenasGoogle?.ultimasResenas && optica.resenasGoogle.ultimasResenas.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 font-display mb-1">Reseñas de Google</h2>
                    <p className="text-gray-600">Opiniones reales de pacientes verificados</p>
                  </div>
                  {optica.resenasGoogle.urlPerfil && (
                    <a href={optica.resenasGoogle.urlPerfil} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-semibold transition-colors">
                      Ver todas en Google <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-navy-900">{optica.resenasGoogle.calificacion}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(optica.resenasGoogle!.calificacion) ? "text-amber-500 fill-current" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{optica.resenasGoogle.totalResenas} reseñas</div>
                  </div>
                </div>
                <div className="space-y-6">
                  {optica.resenasGoogle.ultimasResenas.slice(0, planConfig.limites.maxResenasMostradas).map((resena, index) => (
                    <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
                            <span className="text-navy-700 font-bold text-sm">{resena.autor.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-navy-900">{resena.autor}</p>
                            <p className="text-xs text-gray-500">{resena.fecha}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < resena.calificacion ? "text-amber-500 fill-current" : "text-gray-300"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{resena.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Especialidades */}
            {planConfig && planConfig.limites.maxEspecialidades > 0 && optica.especialidades && optica.especialidades.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-navy-900 font-display mb-6">Especialidades y servicios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {optica.especialidades.slice(0, planConfig.limites.maxEspecialidades).map((esp, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-navy-500 rounded-full"></div>
                      <span className="text-gray-700">{esp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seguros aceptados */}
            {planConfig && planConfig.limites.maxSeguros > 0 && optica.segurosAceptados && optica.segurosAceptados.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-navy-900 font-display mb-6">Seguros aceptados</h2>
                <div className="flex flex-wrap gap-2">
                  {optica.segurosAceptados.slice(0, planConfig.limites.maxSeguros).map((seguro, i) => (
                    <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm border border-blue-100">{seguro}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna lateral (1/3) */}
          <div className="space-y-6">
            {/* Horarios */}
            {optica.horarios && optica.horarios.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Horarios de atención
                </h3>
                <div className="space-y-2">
                  {optica.horarios.map((horario, i) => {
                    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
                    const esHoy = diasSemana[new Date().getDay()] === horario.dia;
                    return (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${esHoy ? "bg-navy-50 border border-navy-200" : "bg-gray-50"}`}>
                        <span className={`font-medium ${esHoy ? "text-navy-900" : "text-gray-700"}`}>
                          {horario.dia}
                          {esHoy && <span className="ml-2 text-xs text-navy-600">(Hoy)</span>}
                        </span>
                        <span className={`text-sm ${horario.cerrado ? "text-red-600" : "text-gray-600"}`}>
                          {horario.cerrado ? "Cerrado" : `${horario.apertura} - ${horario.cierre}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-navy-900 mb-4">Información adicional</h3>
              <div className="space-y-3 text-sm">
                {planConfig?.limites.badgeVerificado && optica.verificada && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>Óptica verificada</span>
                  </div>
                )}
                {optica.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Globe className="w-4 h-4" />
                    <span>{optica.email}</span>
                  </div>
                )}
                {optica.fechaRegistro && (
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Calendar className="w-4 h-4" />
                    <span>Registrada desde {new Date(optica.fechaRegistro).toLocaleDateString("es-MX")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}