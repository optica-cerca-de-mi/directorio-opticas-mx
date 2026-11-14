"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Star,
  Crown,
  ShieldCheck,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Loader2,
  UploadCloud,
  X
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase"; // ✅ Solo necesitamos auth, el resto va al backend
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useConfig } from "@/hooks/useConfig";

interface FormData {
  nombre: string;
  direccion: string;
  ciudad: string;
  estado: string;
  telefono: string;
  googleMapsLink: string;
  horarios: { dia: string; apertura: string; cierre: string; cerrado: boolean }[];
  whatsapp: string;
  sitioWeb: string;
  facebook: string;
  instagram: string;
  especialidades: string[];
  segurosAceptados: string[];
  descripcion: string;
  fotos: string[];
  videoUrl: string;
  planSeleccionado: string;
  billingCycle: "monthly" | "yearly";
  aceptaPoliza: boolean;
  polizaBillingCycle: "monthly" | "yearly";
  aceptaTerminos: boolean;
}

export default function WizardRegistro() {
  const params = useParams();
  const planInicial = (params.plan as string) || "free";

  const [pasoActual, setPasoActual] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    direccion: "",
    ciudad: "",
    estado: "",
    telefono: "",
    googleMapsLink: "",
    horarios: [
      { dia: "Lunes", apertura: "09:00", cierre: "18:00", cerrado: false },
      { dia: "Martes", apertura: "09:00", cierre: "18:00", cerrado: false },
      { dia: "Miércoles", apertura: "09:00", cierre: "18:00", cerrado: false },
      { dia: "Jueves", apertura: "09:00", cierre: "18:00", cerrado: false },
      { dia: "Viernes", apertura: "09:00", cierre: "18:00", cerrado: false },
      { dia: "Sábado", apertura: "10:00", cierre: "14:00", cerrado: false },
      { dia: "Domingo", apertura: "", cierre: "", cerrado: true },
    ],
    whatsapp: "",
    sitioWeb: "",
    facebook: "",
    instagram: "",
    especialidades: [],
    segurosAceptados: [],
    descripcion: "",
    fotos: [],
    videoUrl: "",
    planSeleccionado: planInicial,
    billingCycle: "monthly",
    aceptaPoliza: false,
    polizaBillingCycle: "monthly",
    aceptaTerminos: false,
  });

  const totalPasos = 5;
  const router = useRouter();
  const [publicando, setPublicando] = useState(false);

  const { data: especialidadesData, loading: loadingEspecialidades, error: errorEspecialidades } = useConfig("especialidades");
  const especialidadesDisponibles = especialidadesData?.items || [];

  const { data: segurosData, loading: loadingSeguros, error: errorSeguros } = useConfig("seguros");
  const segurosDisponibles = segurosData?.items || [];

  const { data: estadosData, loading: loadingEstados } = useConfig("estados");
  const estadosMexico = estadosData?.items || [];

  const { data: planesData, loading: loadingPlanes } = useConfig("planes");
  const planesDisponibles = planesData?.items || [];

  const actualizarCampo = (campo: keyof FormData, valor: any) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const toggleEspecialidad = (esp: string) => {
    setFormData((prev) => ({
      ...prev,
      especialidades: prev.especialidades.includes(esp)
        ? prev.especialidades.filter((e) => e !== esp)
        : [...prev.especialidades, esp],
    }));
  };

  const toggleSeguro = (seg: string) => {
    setFormData((prev) => ({
      ...prev,
      segurosAceptados: prev.segurosAceptados.includes(seg)
        ? prev.segurosAceptados.filter((s) => s !== seg)
        : [...prev.segurosAceptados, seg],
    }));
  };

  const actualizarHorario = (index: number, campo: string, valor: any) => {
    const nuevosHorarios = [...formData.horarios];
    nuevosHorarios[index] = { ...nuevosHorarios[index], [campo]: valor };
    actualizarCampo("horarios", nuevosHorarios);
  };

  const puedeAvanzar = () => {
    if (pasoActual === 1) {
      return formData.nombre && formData.direccion && formData.ciudad && formData.estado && formData.telefono && formData.googleMapsLink;
    }
    return true;
  };

  const siguientePaso = () => {
    if (puedeAvanzar() && pasoActual < totalPasos) {
      setPasoActual(pasoActual + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPrecioPolizaAnual = () => {
    const planActual = formData.planSeleccionado;
    if (planActual === "premium") return 990;
    if (planActual === "premium_plus") return 891;
    return 0;
  };

  const getMesesGratisPoliza = () => {
    const planActual = formData.planSeleccionado;
    if (planActual === "premium") return 2;
    if (planActual === "premium_plus") return 3;
    return 0;
  };

  const procesarArchivos = async (archivos: File[]) => {
    const esPremiumPlus = formData.planSeleccionado === "premium_plus";
    const maxFotos = esPremiumPlus ? 15 : 8;
    const espaciosDisponibles = maxFotos - formData.fotos.length;
    
    if (espaciosDisponibles <= 0) {
      alert(`Has alcanzado el límite de ${maxFotos} fotos.`);
      return;
    }

    const archivosAProcesar = archivos.slice(0, espaciosDisponibles);

    for (const archivo of archivosAProcesar) {
      if (archivo.size > 5 * 1024 * 1024) {
        alert(`El archivo "${archivo.name}" excede el límite de 5MB y fue omitido.`);
        continue;
      }

      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", archivo);

        const respuesta = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        const datos = await respuesta.json();

        if (respuesta.ok && datos.success) {
          actualizarCampo("fotos", [...formData.fotos, datos.url]);
        } else {
          console.error(`Error al subir ${archivo.name}:`, datos.error);
        }
      } catch (err) {
        console.error(`Error de conexión al subir ${archivo.name}:`, err);
      }
    }
  };

  // ✅ FUNCIÓN CORREGIDA: incluye 'async' y encadena el checkout si es plan de pago
  const publicarFicha = async () => {
    if (!formData.aceptaTerminos) {
      alert("Para continuar, es obligatorio aceptar los Términos y Condiciones y el Aviso de Privacidad.");
      const checkboxElement = document.getElementById("checkbox-terminos");
      if (checkboxElement) {
        checkboxElement.scrollIntoView({ behavior: "smooth", block: "center" });
        checkboxElement.classList.add("bg-red-50", "ring-2", "ring-red-400");
        setTimeout(() => {
          checkboxElement.classList.remove("bg-red-50", "ring-2", "ring-red-400");
        }, 2000);
      }
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Debes iniciar sesión para registrar una óptica.");
      router.push("/login?redirect=/registro/" + formData.planSeleccionado);
      return;
    }

    setPublicando(true);

    try {
      const idToken = await currentUser.getIdToken();

      // Paso A: crear la óptica (queda pendiente_pago si el plan es de pago)
      const respuesta = await fetch("/api/crear-optica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
          idToken: idToken,
          formData: formData,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || "Error al crear la óptica");
      }

      const opticaId = datos.opticaId;

      // Paso B: si requiere pago, lanzar el checkout de Stripe con ese opticaId
      if (datos.requierePago) {
        const checkoutResp = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: formData.planSeleccionado,
            opticaId: opticaId,
            userEmail: currentUser.email,
            userId: currentUser.uid,
            billingCycle: formData.billingCycle,
            incluirPoliza: formData.aceptaPoliza,
            polizaBillingCycle: formData.polizaBillingCycle,
          }),
        });

        const checkoutData = await checkoutResp.json();

        if (!checkoutResp.ok) {
          throw new Error(checkoutData.error || "Error al iniciar el pago");
        }

        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        } else {
          throw new Error("No se recibió la URL de checkout");
        }
      }

      // Paso C: plan Free, directo al dashboard
      router.push(`/dashboard/${opticaId}`);

    } catch (error: any) {
      console.error("Error al publicar la ficha:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setPublicando(false);
    }
  };

  const planActual = formData.planSeleccionado;
  const esPremium = planActual === "premium" || planActual === "premium_plus";
  const esPremiumPlus = planActual === "premium_plus";

  const planObj = planesDisponibles.find((p) => p.id === planActual);
  const precioPlanMensual = planObj?.precioMensual || 0;
  const precioPlanAnual = planObj?.precioAnual || 0;

  const totalMensual = precioPlanMensual + (formData.aceptaPoliza && formData.polizaBillingCycle === "monthly" ? 99 : 0);
  const totalAnualAmbos = precioPlanAnual + (formData.aceptaPoliza && formData.polizaBillingCycle === "yearly" ? getPrecioPolizaAnual() : 0);
  const totalAnualMixto1 = (precioPlanMensual * 12) + (formData.aceptaPoliza && formData.polizaBillingCycle === "yearly" ? getPrecioPolizaAnual() : 0);
  const totalAnualMixto2 = precioPlanAnual + (formData.aceptaPoliza && formData.polizaBillingCycle === "monthly" ? 99 * 12 : 0);
  const ahorroAnual = ((precioPlanMensual * 12) + 99 * 12) - totalAnualAmbos;

  return (
    <main className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container-premium">
        <div className="max-w-4xl mx-auto mb-8">
          <Link href="/registro" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-navy-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver a planes
          </Link>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-navy-900 font-display">
              Registro de tu óptica
            </h1>
            <span className="text-sm text-gray-500">
              Paso {pasoActual} de {totalPasos}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-navy-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(pasoActual / totalPasos) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card-premium p-6 md:p-8">
              {/* PASO 1 */}
              {pasoActual === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-2 font-display flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Información básica
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Datos fundamentales de tu óptica. Esta información será pública.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Nombre de la óptica *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => actualizarCampo("nombre", e.target.value)}
                        placeholder="Ej: Óptica Visión Clara"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Dirección completa *
                      </label>
                      <input
                        type="text"
                        value={formData.direccion}
                        onChange={(e) => actualizarCampo("direccion", e.target.value)}
                        placeholder="Ej: Av. 1 de Mayo 789, Centro"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          value={formData.ciudad}
                          onChange={(e) => actualizarCampo("ciudad", e.target.value)}
                          placeholder="Ej: Cuautitlán Izcalli"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Estado *
                        </label>
                        <select
                          value={formData.estado}
                          onChange={(e) => actualizarCampo("estado", e.target.value)}
                          disabled={loadingEstados}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {loadingEstados ? "Cargando estados..." : "Selecciona..."}
                          </option>
                          {estadosMexico.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => actualizarCampo("telefono", e.target.value)}
                        placeholder="Ej: 55 1234 5678"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Enlace de Google Maps *
                      </label>
                      <input
                        type="url"
                        value={formData.googleMapsLink}
                        onChange={(e) => actualizarCampo("googleMapsLink", e.target.value)}
                        placeholder="https://maps.app.goo.gl/..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Pega el enlace de "Compartir" de Google Maps de tu sucursal.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2 */}
              {pasoActual === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-2 font-display flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Horarios y contacto
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Indica cuándo estás abierto y cómo pueden contactarte.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Horarios de atención
                      </h3>
                      <div className="space-y-2">
                        {formData.horarios.map((horario, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <label className="flex items-center gap-2 flex-shrink-0 w-32">
                              <input
                                type="checkbox"
                                checked={horario.cerrado}
                                onChange={(e) => actualizarHorario(i, "cerrado", e.target.checked)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm font-medium text-gray-700">{horario.dia}</span>
                            </label>
                            {!horario.cerrado && (
                              <>
                                <input
                                  type="time"
                                  value={horario.apertura}
                                  onChange={(e) => actualizarHorario(i, "apertura", e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <span className="text-gray-400">a</span>
                                <input
                                  type="time"
                                  value={horario.cierre}
                                  onChange={(e) => actualizarHorario(i, "cierre", e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </>
                            )}
                            {horario.cerrado && (
                              <span className="text-sm text-gray-500 italic">Cerrado</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Canales de contacto
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            WhatsApp (con lada, sin +)
                          </label>
                          <input
                            type="text"
                            value={formData.whatsapp}
                            onChange={(e) => actualizarCampo("whatsapp", e.target.value)}
                            placeholder="5215512345678"
                            className="w-full px-4 py-2 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Sitio web
                          </label>
                          <input
                            type="url"
                            value={formData.sitioWeb}
                            onChange={(e) => actualizarCampo("sitioWeb", e.target.value)}
                            placeholder="https://tuoptica.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Facebook
                            </label>
                            <input
                              type="url"
                              value={formData.facebook}
                              onChange={(e) => actualizarCampo("facebook", e.target.value)}
                              placeholder="https://facebook.com/..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Instagram
                            </label>
                            <input
                              type="url"
                              value={formData.instagram}
                              onChange={(e) => actualizarCampo("instagram", e.target.value)}
                              placeholder="https://instagram.com/..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3 */}
              {pasoActual === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-2 font-display flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Servicios y especialidades
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Selecciona los servicios que ofreces. Esto ayuda a los clientes a encontrarte.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Especialidades (selecciona todas las que apliquen)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {loadingEspecialidades ? (
                          <div className="col-span-2 text-center py-8">
                            <Loader2 className="w-8 h-8 border-4 border-navy-200 border-t-navy-700 rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm text-gray-500">Cargando especialidades...</p>
                          </div>
                        ) : errorEspecialidades ? (
                          <div className="col-span-2 text-center py-4 text-red-600 text-sm">
                            Error al cargar especialidades
                          </div>
                        ) : especialidadesDisponibles.length === 0 ? (
                          <div className="col-span-2 text-center py-4 text-gray-500 text-sm">
                            No hay especialidades disponibles
                          </div>
                        ) : (
                          especialidadesDisponibles.map((esp) => (
                            <label
                              key={esp}
                              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                                formData.especialidades.includes(esp)
                                  ? "bg-navy-50 border-navy-300"
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.especialidades.includes(esp)}
                                onChange={() => toggleEspecialidad(esp)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">{esp}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Seguros y convenios aceptados
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {loadingSeguros ? (
                          <div className="col-span-4 text-center py-8">
                            <Loader2 className="w-8 h-8 border-4 border-navy-200 border-t-navy-700 rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm text-gray-500">Cargando seguros...</p>
                          </div>
                        ) : errorSeguros ? (
                          <div className="col-span-4 text-center py-4 text-red-600 text-sm">
                            Error al cargar seguros
                          </div>
                        ) : segurosDisponibles.length === 0 ? (
                          <div className="col-span-4 text-center py-4 text-gray-500 text-sm">
                            No hay seguros disponibles
                          </div>
                        ) : (
                          segurosDisponibles.map((seg) => (
                            <label
                              key={seg}
                              className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all text-sm ${
                                formData.segurosAceptados.includes(seg)
                                  ? "bg-navy-50 border-navy-300 font-medium"
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.segurosAceptados.includes(seg)}
                                onChange={() => toggleSeguro(seg)}
                                className="w-4 h-4"
                              />
                              {seg}
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Descripción de tu óptica
                      </h3>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => actualizarCampo("descripcion", e.target.value)}
                        placeholder="Cuéntanos sobre tu óptica: años de experiencia, especialidades, qué te hace diferente..."
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.descripcion.length} / 600 caracteres
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 4: Contenido (solo Premium/Premium+) */}
              {pasoActual === 4 && esPremium && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-2 font-display flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Contenido visual
                    {esPremiumPlus && <Sparkles className="w-4 h-4 text-gold-500" />}
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    {esPremiumPlus
                      ? "Agrega hasta 15 fotos y un video promocional para maximizar la conversión."
                      : "Agrega hasta 8 fotos de tu óptica."}
                    <span className="block text-amber-600 font-medium mt-1">* Opcional: Puedes subir las fotos después desde tu panel.</span>
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Galería de fotos ({formData.fotos.length}/{esPremiumPlus ? 15 : 8})
                      </h3>

                      {formData.fotos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {formData.fotos.map((foto, i) => (
                            <div key={i} className="relative group aspect-square">
                              <img
                                src={foto}
                                alt={`Foto ${i + 1}`}
                                className="w-full h-full object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const nuevasFotos = formData.fotos.filter((_, idx) => idx !== i);
                                  actualizarCampo("fotos", nuevasFotos);
                                }}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {formData.fotos.length < (esPremiumPlus ? 15 : 8) && (
                        <div 
                          className={`border-2 border-dashed rounded-[var(--radius-premium)] p-8 text-center transition-colors cursor-pointer ${
                            isDragging ? 'border-navy-500 bg-navy-50' : 'border-gray-300 hover:border-navy-400'
                          }`}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => { 
                            e.preventDefault(); 
                            setIsDragging(false); 
                            procesarArchivos(Array.from(e.dataTransfer.files)); 
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              procesarArchivos(Array.from(e.target.files || []));
                              e.target.value = "";
                            }}
                            className="hidden"
                            id="file-input-wizard"
                          />
                          <label htmlFor="file-input-wizard" className="cursor-pointer block">
                            <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              Arrastra tus fotos aquí o haz clic para seleccionar
                            </p>
                            <p className="text-xs text-gray-500">
                              JPG, PNG, WEBP (máx 5MB cada una)
                            </p>
                          </label>
                        </div>
                      )}

                      {formData.fotos.length >= (esPremiumPlus ? 15 : 8) && (
                        <p className="text-sm text-gold-600 font-medium text-center mt-3 flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" />
                          Límite de fotos alcanzado
                        </p>
                      )}
                    </div>

                    {esPremiumPlus && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-gold-500" />
                          Video promocional (Premium+)
                        </h3>
                        <input
                          type="url"
                          value={formData.videoUrl}
                          onChange={(e) => actualizarCampo("videoUrl", e.target.value)}
                          placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          YouTube o Vimeo. Máximo 3 minutos recomendado.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PASO 4 (Free): Resumen */}
              {pasoActual === 4 && !esPremium && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-2 font-display flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Resumen de tu ficha
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Revisa la información antes de publicar.
                  </p>

                  <div className="space-y-4 bg-gray-50 p-6 rounded-[var(--radius-premium)]">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Nombre</p>
                      <p className="font-semibold text-navy-900">{formData.nombre || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Ubicación</p>
                      <p className="text-gray-700">{formData.direccion}, {formData.ciudad}, {formData.estado}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Teléfono</p>
                      <p className="text-gray-700">{formData.telefono}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Especialidades</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.especialidades.length > 0 ? (
                          formData.especialidades.map((e) => (
                            <span key={e} className="text-xs bg-navy-100 text-navy-700 px-2 py-1 rounded-full">
                              {e}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">Ninguna seleccionada</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 5: Plan y confirmación */}
              {pasoActual === 5 && (
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-2 font-display flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Plan y confirmación
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Selecciona tu plan y método de facturación.
                  </p>

                  <div className="space-y-6">
                    {/* Selector de plan */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Plan seleccionado
                      </h3>
                      {loadingPlanes ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 border-4 border-navy-200 border-t-navy-700 rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-sm text-gray-500">Cargando planes...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {planesDisponibles.map((p) => {
                            const Icono = p.icono === "Crown" ? Crown : p.icono === "Star" ? Star : MapPin;
                            const precioTexto = p.id === "free" ? "$0" : formData.billingCycle === "monthly" ? `$${p.precioMensual}/mes` : `$${p.precioAnual}/año`;
                            const isSelected = formData.planSeleccionado === p.id;

                            return (
                              <div
                                key={p.id}
                                onClick={() => actualizarCampo("planSeleccionado", p.id)}
                                className={`p-5 rounded-[var(--radius-premium)] border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? p.id === "premium_plus"
                                      ? "border-gold-400 bg-gold-50 shadow-lg"
                                      : p.id === "premium"
                                      ? "border-navy-900 bg-navy-50 shadow-lg"
                                      : "border-gray-400 bg-gray-50 shadow-lg"
                                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Icono className={`w-5 h-5 ${
                                      p.id === "premium_plus" ? "text-gold-700" : p.id === "premium" ? "text-navy-700" : "text-gray-600"
                                    }`} />
                                    <h4 className="font-bold text-navy-900 text-lg">{p.nombre}</h4>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <p className="text-2xl font-bold text-navy-900">{precioTexto}</p>
                                  {p.id !== "free" && formData.billingCycle === "yearly" && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Equivale a ${Math.round(p.precioAnual / 12)}/mes
                                    </p>
                                  )}
                                </div>

                                {p.descripcion && (
                                  <p className="text-xs text-gray-600 mb-4 italic">{p.descripcion}</p>
                                )}

                                {p.caracteristicas && p.caracteristicas.length > 0 && (
                                  <ul className="space-y-2">
                                    {p.caracteristicas.map((caract, i) => (
                                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                                        <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span>{caract}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                {isSelected && (
                                  <div className="mt-4 pt-3 border-t border-gray-200">
                                    <p className="text-xs font-semibold text-navy-900 text-center flex items-center justify-center gap-1">
                                      <Check className="w-3 h-3" />
                                      Plan seleccionado
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Ciclo de facturación del plan */}
                    {planActual !== "free" && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Ciclo de facturación del plan
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => actualizarCampo("billingCycle", "monthly")}
                            className={`p-4 rounded-[var(--radius-premium)] border-2 text-center transition-all ${
                              formData.billingCycle === "monthly"
                                ? "border-navy-900 bg-navy-50"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <p className="font-bold text-navy-900">Mensual</p>
                            <p className="text-sm text-gray-600">
                              ${precioPlanMensual}/mes
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => actualizarCampo("billingCycle", "yearly")}
                            className={`p-4 rounded-[var(--radius-premium)] border-2 text-center transition-all relative ${
                              formData.billingCycle === "yearly"
                                ? "border-navy-900 bg-navy-50"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <span className="absolute -top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              AHORRA
                            </span>
                            <p className="font-bold text-navy-900">Anual</p>
                            <p className="text-sm text-gray-600">
                              ${precioPlanAnual}/año
                            </p>
                            <p className="text-xs text-green-600 font-semibold mt-1">
                              {planObj?.ahorroAnual || ""}
                            </p>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Póliza de gestión de contenido */}
                    {planActual !== "free" && (
                      <div className="bg-gold-50 border border-gold-300 rounded-[var(--radius-premium)] p-4">
                        <label className="flex items-start gap-3 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            checked={formData.aceptaPoliza}
                            onChange={(e) => actualizarCampo("aceptaPoliza", e.target.checked)}
                            className="w-4 h-4 mt-0.5"
                          />
                          <div>
                            <p className="font-semibold text-navy-900 text-sm">
                              Agregar póliza de gestión de contenido
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Nosotros hacemos hasta 2 cambios al mes por ti. Ideal si no tienes tiempo.
                            </p>
                          </div>
                        </label>

                        {formData.aceptaPoliza && (
                          <div className="ml-7 pt-3 border-t border-gold-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              Ciclo de facturación de la póliza
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => actualizarCampo("polizaBillingCycle", "monthly")}
                                className={`p-3 rounded-lg border-2 text-center transition-all ${
                                  formData.polizaBillingCycle === "monthly"
                                    ? "border-gold-500 bg-gold-100"
                                    : "border-gray-200 bg-white"
                                }`}
                              >
                                <p className="font-bold text-navy-900 text-sm">Mensual</p>
                                <p className="text-xs text-gray-600">$99/mes</p>
                                <p className="text-[10px] text-gray-500 mt-1">Vence en 30 días</p>
                              </button>
                              <button
                                type="button"
                                onClick={() => actualizarCampo("polizaBillingCycle", "yearly")}
                                className={`p-3 rounded-lg border-2 text-center transition-all relative ${
                                  formData.polizaBillingCycle === "yearly"
                                    ? "border-gold-500 bg-gold-100"
                                    : "border-gray-200 bg-white"
                                }`}
                              >
                                <span className="absolute -top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  AHORRA
                                </span>
                                <p className="font-bold text-navy-900 text-sm">Anual</p>
                                <p className="text-xs text-gray-600">${getPrecioPolizaAnual()}/año</p>
                                <p className="text-[10px] text-green-600 font-semibold mt-1">
                                  {getMesesGratisPoliza()} meses gratis
                                </p>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Resumen de tu inversión */}
                    <div className="bg-navy-900 text-white p-6 rounded-[var(--radius-premium)]">
                      <h3 className="font-bold mb-4">Resumen de tu inversión</h3>
                      <div className="space-y-3 text-sm">
                        {planActual !== "free" && (
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Plan {planActual === "premium" ? "Premium" : "Premium+"}</p>
                              <p className="text-xs text-gray-400">
                                {formData.billingCycle === "monthly" ? "Facturación mensual" : "Facturación anual"}
                              </p>
                            </div>
                            <span className="font-semibold text-right">
                              {formData.billingCycle === "monthly"
                                ? `$${precioPlanMensual}/mes`
                                : `$${precioPlanAnual}/año`}
                            </span>
                          </div>
                        )}

                        {formData.aceptaPoliza && (
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Póliza de gestión</p>
                              <p className="text-xs text-gray-400">
                                {formData.polizaBillingCycle === "monthly" ? "Facturación mensual" : "Facturación anual"}
                              </p>
                            </div>
                            <span className="font-semibold text-right">
                              {formData.polizaBillingCycle === "monthly"
                                ? "$99/mes"
                                : `$${getPrecioPolizaAnual()}/año`}
                            </span>
                          </div>
                        )}

                        {planActual !== "free" && (
                          <div className="border-t border-navy-700 pt-3 mt-3">
                            {formData.billingCycle === "monthly" && (!formData.aceptaPoliza || formData.polizaBillingCycle === "monthly") && (
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-bold">Total mensual</p>
                                  <p className="text-xs text-gray-400">Se cobra cada mes</p>
                                </div>
                                <span className="font-bold text-gold-400 text-lg">
                                  ${totalMensual}/mes
                                </span>
                              </div>
                            )}

                            {formData.billingCycle === "yearly" && formData.aceptaPoliza && formData.polizaBillingCycle === "yearly" && (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-bold">Total anual</p>
                                    <p className="text-xs text-gray-400">Se cobra cada año</p>
                                  </div>
                                  <span className="font-bold text-gold-400 text-lg">
                                    ${totalAnualAmbos}/año
                                  </span>
                                </div>
                                <div className="bg-green-900/30 border border-green-700 rounded p-2 text-xs">
                                  <p className="text-green-400 font-semibold mb-1">Tu ahorro anual</p>
                                  <p className="text-gray-300">
                                    Equivale a <span className="font-bold text-white">${Math.round(totalAnualMixto1 / 12)}/mes</span>
                                  </p>
                                </div>
                              </div>
                            )}

                            {formData.billingCycle === "monthly" && formData.aceptaPoliza && formData.polizaBillingCycle === "yearly" && (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-bold">Total del primer año</p>
                                    <p className="text-xs text-gray-400">Plan mensual + Póliza anual</p>
                                  </div>
                                  <span className="font-bold text-gold-400 text-lg">
                                    ${totalAnualMixto1}
                                  </span>
                                </div>
                                <div className="bg-navy-800 rounded p-2 text-xs">
                                  <p className="text-gray-300">
                                    Equivale a <span className="font-bold text-white">${Math.round(totalAnualMixto2 / 12)}/mes</span>
                                  </p>
                                </div>
                              </div>
                            )}

                            {formData.billingCycle === "yearly" && formData.aceptaPoliza && formData.polizaBillingCycle === "monthly" && (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-bold">Total del primer año</p>
                                    <p className="text-xs text-gray-400">Plan anual + Póliza mensual</p>
                                  </div>
                                  <span className="font-bold text-gold-400 text-lg">
                                    ${totalAnualMixto2}
                                  </span>
                                </div>
                                <div className="bg-navy-800 rounded p-2 text-xs">
                                  <p className="text-gray-300">
                                    Pagando anual ahorras <span className="font-bold text-white">${(precioPlanMensual * 12) - precioPlanAnual}</span>
                                  </p>
                                </div>
                              </div>
                            )}

                            {formData.billingCycle === "yearly" && !formData.aceptaPoliza && (
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-bold">Total anual</p>
                                  <p className="text-xs text-gray-400">Se cobra cada año</p>
                                </div>
                                <span className="font-bold text-gold-400 text-lg">
                                  ${precioPlanAnual}/año
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {planActual === "free" && (
                          <div className="flex justify-between items-center">
                            <p className="font-bold">Total</p>
                            <span className="font-bold text-gold-400 text-lg">$0</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ✅ CHECKBOX DE CONSENTIMIENTO LEGAL OBLIGATORIO */}
                  <div id="checkbox-terminos" className="mt-6 pt-6 border-t-2 border-gold-200 bg-gold-50/30 p-4 rounded-lg">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        required
                        checked={formData.aceptaTerminos}
                        onChange={(e) => actualizarCampo("aceptaTerminos", e.target.checked)}
                        className="mt-1 w-5 h-5 text-navy-900 border-gray-400 rounded focus:ring-gold-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">
                        He leído y acepto los{" "}
                        <a 
                          href="/terminos-y-condiciones" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-gold-700 underline hover:text-gold-900 font-semibold"
                        >
                          Términos y Condiciones
                        </a>{" "}
                        y el{" "}
                        <a 
                          href="/aviso-de-privacidad" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-gold-700 underline hover:text-gold-900 font-semibold"
                        >
                          Aviso de Privacidad
                        </a>
                        . Consiento el tratamiento de mis datos personales conforme a lo establecido en dicho aviso.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navegación del wizard (SIEMPRE VISIBLE, fuera de los pasos) */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {pasoActual > 1 ? (
                  <button
                    onClick={pasoAnterior}
                    className="btn-secondary text-sm gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Anterior
                  </button>
                ) : (
                  <div></div>
                )}

                {pasoActual < totalPasos ? (
                  <button
                    onClick={siguientePaso}
                    disabled={!puedeAvanzar()}
                    className={`btn-primary text-sm gap-2 ${
                      !puedeAvanzar() ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={publicarFicha}
                    disabled={publicando || !formData.aceptaTerminos}
                    className={`btn-primary bg-gold-500 hover:bg-gold-400 text-white text-sm gap-2 transition-all ${
                      publicando || !formData.aceptaTerminos 
                        ? "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400" 
                        : "shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {publicando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creando cuenta y publicando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Publicar mi ficha
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Columna lateral: Preview en vivo */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="card-premium p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-navy-700" />
                    <h3 className="font-bold text-navy-900 text-sm">Vista previa</h3>
                  </div>
                  <span className="text-xs text-gray-500">
                    Paso {pasoActual}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-navy-700" />
                    </div>
                    {formData.planSeleccionado === "premium_plus" && (
                      <span className="badge-premium-plus text-[9px] px-2 py-0.5">
                        PREMIUM+
                      </span>
                    )}
                    {formData.planSeleccionado === "premium" && (
                      <span className="badge-premium text-[9px] px-2 py-0.5">
                        PREMIUM
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-navy-900 text-sm mb-1 font-display">
                      {formData.nombre || "Nombre de tu óptica"}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {formData.ciudad && formData.estado
                        ? `${formData.ciudad}, ${formData.estado}`
                        : "Ciudad, Estado"}
                    </p>
                    {formData.telefono && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {formData.telefono}
                      </p>
                    )}
                  </div>

                  {pasoActual >= 2 && formData.horarios.some(h => !h.cerrado) && (
                    <div className="border-t border-gray-200 pt-2">
                      <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Horarios
                      </p>
                      <div className="space-y-0.5">
                        {formData.horarios.slice(0, 3).map((h, i) => (
                          !h.cerrado && (
                            <p key={i} className="text-[10px] text-gray-600">
                              {h.dia}: {h.apertura} - {h.cierre}
                            </p>
                          )
                        ))}
                        {formData.horarios.filter(h => !h.cerrado).length > 3 && (
                          <p className="text-[10px] text-gray-400 italic">
                            +{formData.horarios.filter(h => !h.cerrado).length - 3} días más
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {pasoActual >= 3 && formData.especialidades.length > 0 && (
                    <div className="border-t border-gray-200 pt-2">
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Especialidades
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {formData.especialidades.slice(0, 4).map((e) => (
                          <span key={e} className="text-[10px] bg-navy-50 text-navy-700 px-1.5 py-0.5 rounded-full">
                            {e}
                          </span>
                        ))}
                        {formData.especialidades.length > 4 && (
                          <span className="text-[10px] text-gray-500 px-1 py-0.5">
                            +{formData.especialidades.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {(formData.planSeleccionado === "premium" || formData.planSeleccionado === "premium_plus") && pasoActual >= 3 && (
                    <div className="border-t border-gray-200 pt-2">
                      <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Reseñas Google
                      </p>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-600">4.9 (127)</span>
                      </div>
                    </div>
                  )}

                  {pasoActual >= 4 && esPremium && formData.fotos.length > 0 && (
                    <div className="border-t border-gray-200 pt-2">
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Galería ({formData.fotos.length})
                      </p>
                      <div className="grid grid-cols-3 gap-1">
                        {formData.fotos.slice(0, 3).map((foto, i) => (
                          <div key={i} className="aspect-square bg-gray-200 rounded overflow-hidden">
                            <img src={foto} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pasoActual >= 4 && esPremiumPlus && formData.videoUrl && (
                    <div className="border-t border-gray-200 pt-2">
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-gold-500" />
                        Video promocional
                      </p>
                      <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-navy-900 ml-1"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(formData.planSeleccionado === "premium" || formData.planSeleccionado === "premium_plus") && (
                    <div className="border-t border-gray-200 pt-2">
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Cómo llegar
                      </p>
                      <div className="flex gap-1">
                        <button className="flex-1 px-2 py-1 bg-blue-500 text-white text-[10px] rounded font-medium">
                          Google Maps
                        </button>
                        <button className="flex-1 px-2 py-1 bg-cyan-500 text-white text-[10px] rounded font-medium">
                          Waze
                        </button>
                      </div>
                    </div>
                  )}

                  {esPremiumPlus && (
                    <div className="border-t border-gray-200 pt-2">
                      <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        Reseñas nativas
                      </p>
                      <div className="p-2 bg-navy-50 rounded border border-navy-200">
                        <p className="text-[10px] text-navy-700 italic">
                          "Excelente servicio y atención..."
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    {formData.whatsapp && (
                      <button className="w-full btn-secondary text-[10px] py-1.5 mb-1.5 gap-1">
                        <MessageCircle className="w-3 h-3 text-green-600" />
                        WhatsApp
                      </button>
                    )}
                    <button className="w-full btn-primary text-[10px] py-1.5">
                      Ver ficha completa
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Vista previa en tiempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}