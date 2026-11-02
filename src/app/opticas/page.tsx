"use client";

import { useEffect, useState, useMemo } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useOptiRank } from "@/hooks/useOptiRank";
import { useUserLocation } from "@/hooks/useUserLocation";
import { estaAbiertaEn } from "@/lib/ranking-engine";
import { Optica } from "@/types/optica";
import {
  MapPin,
  Search,
  Filter,
  Star,
  Crown,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Phone,
  MessageCircle,
  X,
  Eye,
  TrendingUp,
  Clock,
  Shield,
  LocateFixed,
  Sparkles,
  Info,
  Navigation,
} from "lucide-react";
import Link from "next/link";

export default function OpticasPage() {
  const [opticas, setOpticas] = useState<Optica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroSeguro, setFiltroSeguro] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  const [abiertasAhora, setAbiertasAhora] = useState(false);
  const [cercaDeMi, setCercaDeMi] = useState(false);
  const [radioBusqueda, setRadioBusqueda] = useState(25); // km, default 25
  const [errorUbicacion, setErrorUbicacion] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  const [segurosDisponibles, setSegurosDisponibles] = useState<string[]>([]);
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<string[]>([]);

  // Hook de ubicación global
  const { location: ubicacionGlobal, consent: consentimientoUbicacion } = useUserLocation();

  // Session ID para tracking anónimo
  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "anonimo";
    let id = sessionStorage.getItem("sessionId");
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("sessionId", id);
    }
    return id;
  }, []);

  // Detectar dispositivo (memoizado)
  const dispositivo = useMemo(() => {
    if (typeof window === "undefined") return "desktop";
    return window.innerWidth < 768 ? "movil" : "desktop";
  }, []);

  // Hora actual memoizada
  const horaActual = useMemo(() => {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), ahora.getHours(), ahora.getMinutes(), 0);
  }, []);

  // Auto-activar "Cerca de mí" si el usuario ya dio consentimiento global
  useEffect(() => {
    if (consentimientoUbicacion === "granted" && ubicacionGlobal) {
      setCercaDeMi(true);
    }
  }, [consentimientoUbicacion, ubicacionGlobal]);

  useEffect(() => {
    const cargarOpticas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "opticas"));
        const opticasData: Optica[] = [];
        const segurosSet = new Set<string>();
        const especialidadesSet = new Set<string>();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.estado !== "inactiva" && data.estado !== "eliminada") {
            const nombre = data.nombre || data.nombreComercial || "Sin nombre";
            opticasData.push({
              id: doc.id,
              uid: data.uid || doc.id,
              slug: data.slug || doc.id,
              nombre: nombre,
              direccion: data.direccion || "",
              ciudad: data.ciudad || "",
              estado: data.estado || "",
              telefono: data.telefono || "",
              whatsapp: data.whatsapp || "",
              especialidades: data.especialidades || [],
              segurosAceptados: data.segurosAceptados || [],
              fotos: data.fotos || data.galeria || [],
              plan: data.plan || "free",
              verificado: data.verificado || data.plan !== "free",
              descripcion: data.descripcion || "",
              horarios: data.horarios || [],
              latitud: data.latitud,
              longitud: data.longitud,
              calificacionGoogle: data.calificacionGoogle,
              fechaCreacion: data.fechaCreacion,
              redesSociales: data.redesSociales,
              videoUrl: data.videoUrl,
            } as Optica);

            (data.segurosAceptados || []).forEach((s: string) => segurosSet.add(s));
            (data.especialidades || []).forEach((e: string) => especialidadesSet.add(e));
          }
        });

        setOpticas(opticasData);
        setSegurosDisponibles(Array.from(segurosSet).sort());
        setEspecialidadesDisponibles(Array.from(especialidadesSet).sort());
      } catch (err) {
        console.error("Error al cargar ópticas:", err);
        setError("Error al cargar el directorio de ópticas");
      } finally {
        setCargando(false);
      }
    };

    cargarOpticas();
  }, []);

  const solicitarUbicacion = () => {
    setErrorUbicacion("");
    
    // Si ya hay consentimiento global, solo activar "Cerca de mí"
    if (consentimientoUbicacion === "granted" && ubicacionGlobal) {
      setCercaDeMi(true);
      return;
    }

    // Si no hay consentimiento, redirigir para que el modal aparezca
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("reset_location", "true");
    window.location.href = currentUrl.toString();
  };

  const opticasFiltradas = opticas.filter((optica) => {
    const coincideBusqueda =
      !busqueda ||
      optica.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      optica.ciudad.toLowerCase().includes(busqueda.toLowerCase()) ||
      optica.direccion.toLowerCase().includes(busqueda.toLowerCase());

    const coincideSeguro = !filtroSeguro || (optica.segurosAceptados || []).includes(filtroSeguro);
    const coincideEspecialidad = !filtroEspecialidad || (optica.especialidades || []).includes(filtroEspecialidad);
    const coincideAbierta = !abiertasAhora || estaAbiertaEn(optica.horarios || []).abierta;

    return coincideBusqueda && coincideSeguro && coincideEspecialidad && coincideAbierta;
  });

  const {
    opticasRanking,
    metricas,
    trackClic,
    trackWhatsApp,
    perfilDetectado,
  } = useOptiRank({
    opticas: opticasFiltradas,
    contexto: {
      ubicacionUsuario: cercaDeMi ? ubicacionGlobal || undefined : undefined,
      filtros: {
        especialidad: filtroEspecialidad || undefined,
        seguro: filtroSeguro || undefined,
        abiertaAhora: abiertasAhora || undefined,
        textoBusqueda: busqueda || undefined,
      },
      horaActual,
      dispositivo,
      sessionId,
    },
    topRecomendadas: 3,
    autoTrack: true,
  });

  // ✅ NUEVO: Filtrar por radio de búsqueda
  const opticasFinales = opticasRanking.filter((optica) => {
    const distancia = (optica as any).distanciaKm;
    
    // Si no hay distancia (usuario no activó "Cerca de mí"), mostrar todas
    if (distancia === undefined || distancia === null) return true;
    
    // Si el radio es 0, no hay límite
    if (radioBusqueda === 0) return true;
    
    // Filtrar por radio
    return distancia <= radioBusqueda;
  });

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroSeguro("");
    setFiltroEspecialidad("");
    setAbiertasAhora(false);
    setCercaDeMi(false);
    setRadioBusqueda(25); // Reset a 25 km
    setErrorUbicacion("");
  };

  const hayFiltrosActivos = busqueda || filtroSeguro || filtroEspecialidad || abiertasAhora || cercaDeMi;

  const totalOpticas = opticas.length;
  const totalFiltradas = opticasFinales.length;
  
  // ✅ NUEVO: Texto del contador con radio
  const textoContador = cercaDeMi
    ? `${totalFiltradas} ópticas dentro de ${radioBusqueda === 0 ? "cualquier distancia" : `${radioBusqueda} km`}`
    : totalFiltradas === 1 
      ? "1 óptica encontrada" 
      : `${totalFiltradas} ópticas encontradas`;

  const perfilLabels: Record<string, string> = {
    urgencia: "Búsqueda urgente",
    planificador: "Planificador",
    explorador: "Explorador",
    recurrente: "Cliente recurrente",
  };

  const perfilIconos: Record<string, any> = {
    urgencia: Clock,
    planificador: Search,
    explorador: Sparkles,
    recurrente: TrendingUp,
  };

  const IconoPerfilActual = perfilIconos[perfilDetectado] || Sparkles;
  const LabelPerfilActual = perfilLabels[perfilDetectado] || "Explorador";

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-navy-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando directorio de ópticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-900 mb-2">Error al cargar</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-navy-900 text-white rounded-lg font-semibold hover:bg-navy-800">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-premium py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-navy-900 font-display mb-3">
              Directorio de ópticas
            </h1>
            <p className="text-gray-600 mb-6">
              Encuentra la óptica perfecta cerca de ti. {textoContador}.
            </p>

            {/* Indicador de ubicación activa */}
            {ubicacionGlobal && (
              <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Ubicación activa · Mostrando ópticas cercanas
                </span>
              </div>
            )}

            {/* Indicador de perfil detectado */}
            {metricas && (
              <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-navy-50 border border-navy-200 rounded-full">
                <IconoPerfilActual className="w-4 h-4 text-navy-700" />
                <span className="text-sm font-medium text-navy-900">
                  Modo: {LabelPerfilActual}
                </span>
                <button onClick={() => setMostrarPerfil(!mostrarPerfil)} className="ml-1 text-navy-600 hover:text-navy-900">
                  <Info className="w-3 h-3" />
                </button>
              </div>
            )}

            {mostrarPerfil && (
              <div className="max-w-2xl mx-auto mb-4 p-4 bg-gold-50 border border-gold-200 rounded-lg text-left">
                <p className="text-sm font-semibold text-navy-900 mb-2">¿Cómo funciona nuestra recomendación?</p>
                <p className="text-xs text-gray-700 mb-2">
                  Detectamos tu intención de búsqueda y ajustamos el orden de las ópticas según lo que más te importa:
                </p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li><strong>Urgencia:</strong> Prioriza ópticas abiertas, cercanas y con WhatsApp activo</li>
                  <li><strong>Planificador:</strong> Prioriza calificación, especialidades y ficha completa</li>
                  <li><strong>Explorador:</strong> Muestra ópticas premium con mejor contenido</li>
                  <li><strong>Recurrente:</strong> Diversifica resultados y recuerda tus preferencias</li>
                </ul>
              </div>
            )}

            {/* Barra de búsqueda */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, ciudad o dirección..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-premium py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar de filtros */}
          <aside className={`${mostrarFiltros ? "block" : "hidden"} md:block md:w-72 flex-shrink-0`}>
            <div className="card-premium p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-navy-900 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </h3>
                {hayFiltrosActivos && (
                  <button onClick={limpiarFiltros} className="text-xs text-navy-700 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Limpiar
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="checkbox" checked={abiertasAhora} onChange={(e) => setAbiertasAhora(e.target.checked)} className="w-4 h-4" />
                  <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Abiertas ahora</p>
                    <p className="text-xs text-gray-500">Solo ópticas abiertas en este momento</p>
                  </div>
                </label>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <button
                    onClick={solicitarUbicacion}
                    disabled={cercaDeMi}
                    className={`w-full flex items-center gap-3 text-left ${cercaDeMi ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-100"} rounded-lg transition-colors`}
                  >
                    <LocateFixed className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">{cercaDeMi ? "Cerca de ti activado" : "Cerca de mí"}</p>
                      <p className="text-xs text-gray-500">{cercaDeMi ? "Ordenadas por distancia" : "Usa tu ubicación para encontrar las más cercanas"}</p>
                    </div>
                  </button>
                  {errorUbicacion && <p className="text-xs text-red-600 mt-2">{errorUbicacion}</p>}
                </div>

                {/* ✅ NUEVO: Selector de radio de búsqueda */}
                {cercaDeMi && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <LocateFixed className="w-3 h-3" />
                      Radio de búsqueda
                    </label>
                    <div className="space-y-2">
                      {[
                        { valor: 10, label: "10 km", descripcion: "Muy cercanas" },
                        { valor: 25, label: "25 km", descripcion: "Recomendado" },
                        { valor: 50, label: "50 km", descripcion: "Zonas vecinas" },
                        { valor: 100, label: "100 km", descripcion: "Máximo alcance" },
                        { valor: 0, label: "Sin límite", descripcion: "Todas las distancias" },
                      ].map((opcion) => (
                        <label
                          key={opcion.valor}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="radioBusqueda"
                            value={opcion.valor}
                            checked={radioBusqueda === opcion.valor}
                            onChange={(e) => setRadioBusqueda(Number(e.target.value))}
                            className="w-3 h-3 text-navy-900"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-700">{opcion.label}</p>
                            <p className="text-[10px] text-gray-500">{opcion.descripcion}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {segurosDisponibles.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Seguro que acepte
                    </label>
                    <select value={filtroSeguro} onChange={(e) => setFiltroSeguro(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-navy-500 bg-white">
                      <option value="">Todos los seguros</option>
                      {segurosDisponibles.map((seguro) => (
                        <option key={seguro} value={seguro}>{seguro}</option>
                      ))}
                    </select>
                  </div>
                )}

                {especialidadesDisponibles.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Especialidad
                    </label>
                    <select value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-navy-500 bg-white">
                      <option value="">Todas</option>
                      {especialidadesDisponibles.map((esp) => (
                        <option key={esp} value={esp}>{esp}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>{totalFiltradas} de {totalOpticas} ópticas</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de ópticas */}
          <div className="flex-1">
            {opticasFinales.length === 0 ? (
              <div className="card-premium p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-navy-900 mb-2">No se encontraron ópticas</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {cercaDeMi && radioBusqueda > 0 
                    ? `No hay ópticas dentro de ${radioBusqueda} km. Intenta aumentar el radio o desactivar "Cerca de mí".`
                    : "Intenta cambiar los filtros o la búsqueda."}
                </p>
                <button onClick={limpiarFiltros} className="px-4 py-2 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opticasFinales.map((optica, index) => {
                  const { abierta, minutosParaCierre } = estaAbiertaEn(optica.horarios || []);
                  const imagenPrincipal = optica.fotos?.[0] || (optica as any).galeria?.[0];
                  const esTopRecomendada = index < 3;
                  const planNormalizado = optica.plan || "free";

                  return (
                    <div key={optica.id} className="card-premium overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                      {/* Imagen */}
                      <Link 
                        href={`/opticas/${optica.slug || optica.id}`} 
                        className="block relative aspect-[4/3] bg-gray-200 overflow-hidden" 
                        onClick={() => trackClic(optica.id, index, (optica as any).score || 0)}
                      >
                        {imagenPrincipal ? (
                          <img src={imagenPrincipal} alt={optica.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-100 to-navy-200">
                            <MapPin className="w-12 h-12 text-navy-400" />
                          </div>
                        )}

                        {/* Badge RECOMENDADO - SOLO TOP 3 */}
                        {esTopRecomendada && (
                          <div className="absolute top-3 right-3 z-10">
                            <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              RECOMENDADO
                            </span>
                          </div>
                        )}

                        {/* Badge Plan */}
                        {(planNormalizado === "premium_plus" || planNormalizado === "premium") && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className={`px-2 py-1 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-sm ${
                              planNormalizado === "premium_plus" ? "bg-amber-500" : "bg-navy-900"
                            }`}>
                              {planNormalizado === "premium_plus" ? <Crown className="w-2.5 h-2.5" /> : <Star className="w-2.5 h-2.5" />}
                              {planNormalizado === "premium_plus" ? "PREMIUM+" : "PREMIUM"}
                            </span>
                          </div>
                        )}

                        {/* Badge Distancia */}
                        {(optica as any).distanciaKm !== undefined && (optica as any).distanciaKm !== null && (
                          <div className="absolute bottom-3 right-3 z-10">
                            <span className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-sm">
                              <LocateFixed className="w-2.5 h-2.5" />
                              {(optica as any).distanciaKm < 1 ? `${Math.round((optica as any).distanciaKm * 1000)} m` : `${(optica as any).distanciaKm.toFixed(1)} km`}
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* BADGES DEBAJO DE LA IMAGEN */}
                      <div className="px-4 pt-3 pb-2 flex flex-wrap items-center gap-2 border-b border-gray-100">
                        {optica.verificado && planNormalizado !== "free" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Verificada
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          abierta ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${abierta ? "bg-green-500" : "bg-red-500"}`} />
                          {abierta ? "Abierta" : "Cerrada"}
                        </span>
                        {minutosParaCierre > 0 && minutosParaCierre < 60 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-semibold rounded-full">
                            <Clock className="w-2.5 h-2.5" />
                            Cierra en {minutosParaCierre} min
                          </span>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="p-4 flex flex-col flex-1">
                        <Link href={`/opticas/${optica.slug || optica.id}`}>
                          <h3 className="font-bold text-navy-900 mb-1 font-display group-hover:text-navy-700 transition-colors line-clamp-1">
                            {optica.nombre}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-600 mb-3 flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{optica.ciudad}{optica.estado ? `, ${optica.estado}` : ""}</span>
                        </p>

                        {/* Especialidades */}
                        {(optica.especialidades || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {optica.especialidades!.slice(0, 2).map((esp) => (
                              <span key={esp} className="text-[10px] bg-navy-50 text-navy-700 px-2 py-0.5 rounded-full">{esp}</span>
                            ))}
                            {optica.especialidades!.length > 2 && (
                              <span className="text-[10px] text-gray-500 px-1 py-0.5">+{optica.especialidades!.length - 2}</span>
                            )}
                          </div>
                        )}

                        {/* Seguros */}
                        {(optica.segurosAceptados || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {optica.segurosAceptados!.slice(0, 2).map((seg) => (
                              <span key={seg} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Shield className="w-2 h-2" />
                                {seg}
                              </span>
                            ))}
                            {optica.segurosAceptados!.length > 2 && (
                              <span className="text-[10px] text-gray-500 px-1 py-0.5">+{optica.segurosAceptados!.length - 2}</span>
                            )}
                          </div>
                        )}

                        {/* Razón de recomendación */}
                        {(optica as any).razon && (
                          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-[10px] text-amber-800 italic flex items-start gap-1">
                              <Sparkles className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                              {(optica as any).razon}
                            </p>
                          </div>
                        )}

                        {/* Descripción truncada */}
                        {optica.descripcion && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-3 flex-1">{optica.descripcion}</p>
                        )}

                        {/* Botones de acción */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
                          <Link 
                            href={`/opticas/${optica.slug || optica.id}`} 
                            onClick={() => trackClic(optica.id, index, (optica as any).score || 0)} 
                            className="flex-1 px-3 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver ficha
                          </Link>
                          {optica.whatsapp && (
                            <a 
                              href={`https://wa.me/${optica.whatsapp.replace(/\D/g, "")}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={() => trackWhatsApp(optica.id)} 
                              className="w-9 h-9 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center" 
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                          {optica.telefono && (
                            <a 
                              href={`tel:${optica.telefono}`} 
                              className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center" 
                              title="Llamar"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}