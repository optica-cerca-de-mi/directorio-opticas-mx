"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Settings,
  User,
  Bell,
  Shield,
  AlertTriangle,
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  Mail,
  Lock,
  Trash2,
  Crown,
  Star,
  Video,
  MessageCircle,
  TrendingUp,
  Award,
} from "lucide-react";

interface AtributosSuscripcion {
  badgeVerificado: boolean;
  whatsapp: boolean;
  reseñasGoogle: boolean;
  reseñasNativas: boolean;
  videoPromocional: boolean;
  estadisticas: boolean;
  accesoB2B: boolean;
  fotosMaximas: number;
  fotosActuales: number;
}

export default function ConfiguracionPage() {
  const params = useParams();
  const router = useRouter();
  const opticaId = params.opticaId as string;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [opticaData, setOpticaData] = useState({
    email: "",
    plan: "free",
    fotos: [],
    notificacionesEmail: true,
    notificacionesWhatsApp: false,
    reporteMensual: true,
  });

  const [atributos, setAtributos] = useState<AtributosSuscripcion>({
    badgeVerificado: false,
    whatsapp: false,
    reseñasGoogle: false,
    reseñasNativas: false,
    videoPromocional: false,
    estadisticas: false,
    accesoB2B: false,
    fotosMaximas: 3,
    fotosActuales: 0,
  });

  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const docRef = doc(db, "opticas", opticaId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setOpticaData({
            email: data.email || "",
            plan: data.plan || "free",
            fotos: data.fotos || [],
            notificacionesEmail: data.notificacionesEmail ?? true,
            notificacionesWhatsApp: data.notificacionesWhatsApp ?? false,
            reporteMensual: data.reporteMensual ?? true,
          });

          // Calcular atributos según el plan
          const esPremium = data.plan === "premium" || data.plan === "premium_plus";
          const esPremiumPlus = data.plan === "premium_plus";

          setAtributos({
            badgeVerificado: esPremium,
            whatsapp: esPremium,
            reseñasGoogle: esPremium,
            reseñasNativas: esPremiumPlus,
            videoPromocional: esPremiumPlus,
            estadisticas: esPremium,
            accesoB2B: esPremiumPlus,
            fotosMaximas: data.plan === "free" ? 3 : esPremiumPlus ? 12 : 8,
            fotosActuales: data.fotos?.length || 0,
          });
        }
      } catch (err) {
        console.error("Error al cargar:", err);
        setError("Error al cargar la configuración");
      } finally {
        setCargando(false);
      }
    };

    if (opticaId) cargarConfiguracion();
  }, [opticaId]);

  const handleGuardarConfiguracion = async () => {
    setGuardando(true);
    setMensaje("");
    setError("");

    try {
      const docRef = doc(db, "opticas", opticaId);
      await setDoc(
        docRef,
        {
          notificacionesEmail: opticaData.notificacionesEmail,
          notificacionesWhatsApp: opticaData.notificacionesWhatsApp,
          reporteMensual: opticaData.reporteMensual,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setMensaje("Configuración actualizada correctamente");
    } catch (err) {
      console.error("Error al guardar:", err);
      setError("Error al guardar la configuración");
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarContrasena = async () => {
    setMensaje("");
    setError("");
    alert("Función en desarrollo. Contacta a soporte para cambiar tu contraseña.");
  };

  if (cargando) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-navy-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 font-display mb-2">
          Configuración
        </h1>
        <p className="text-gray-600">
          Gestiona las preferencias de tu cuenta y los atributos de tu suscripción.
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

      <div className="space-y-6">
        {/* ATRIBUTOS DE SUSCRIPCIÓN - NUEVO PANEL */}
        <div className="card-premium p-6 border-2 border-navy-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-navy-900 mb-1 flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Atributos de mi suscripción
              </h2>
              <p className="text-sm text-gray-600">
                Características activas según tu plan {opticaData.plan === "premium_plus" ? "Premium+" : opticaData.plan === "premium" ? "Premium" : "Gratuito"}
              </p>
            </div>
            <div className="px-3 py-1 bg-navy-900 text-white text-xs font-bold rounded-full">
              {opticaData.plan === "premium_plus" ? "PREMIUM+" : opticaData.plan === "premium" ? "PREMIUM" : "GRATUITO"}
            </div>
          </div>

          {/* Características activas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {/* Badge de verificado */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className={`w-4 h-4 ${atributos.badgeVerificado ? "text-green-600" : "text-gray-400"}`} />
                <span className="text-sm font-medium text-gray-700">Badge de verificado</span>
              </div>
              {atributos.badgeVerificado ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* WhatsApp */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className={`w-4 h-4 ${atributos.whatsapp ? "text-green-600" : "text-gray-400"}`} />
                <span className="text-sm font-medium text-gray-700">Botón de WhatsApp</span>
              </div>
              {atributos.whatsapp ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Reseñas Google */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${atributos.reseñasGoogle ? "text-green-600" : "text-gray-400"}`} />
                <span className="text-sm font-medium text-gray-700">Reseñas Google</span>
              </div>
              {atributos.reseñasGoogle ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Estadísticas */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${atributos.estadisticas ? "text-green-600" : "text-gray-400"}`} />
                <span className="text-sm font-medium text-gray-700">Estadísticas</span>
              </div>
              {atributos.estadisticas ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Video promocional */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Video className={`w-4 h-4 ${atributos.videoPromocional ? "text-green-600" : "text-gray-400"}`} />
                <span className="text-sm font-medium text-gray-700">Video promocional</span>
              </div>
              {atributos.videoPromocional ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Reseñas nativas */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className={`w-4 h-4 ${atributos.reseñasNativas ? "text-green-600" : "text-gray-400"}`} />
                <span className="text-sm font-medium text-gray-700">Reseñas nativas</span>
              </div>
              {atributos.reseñasNativas ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Acceso B2B */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg md:col-span-2">
              <div className="flex items-center gap-2">
                <Crown className={`w-4 h-4 ${atributos.accesoB2B ? "text-gold-600" : "text-gray-400"}`} />
                <span className="text-sm font-medium text-gray-700">Acceso a proveedores y servicios (B2B)</span>
              </div>
              {atributos.accesoB2B ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Límite de fotos */}
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-navy-700" />
                <span className="text-sm font-medium text-gray-700">Galería de fotos</span>
              </div>
              <span className="text-sm font-bold text-navy-900">
                {atributos.fotosActuales} de {atributos.fotosMaximas} fotos
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-navy-700 transition-all"
                style={{ width: `${(atributos.fotosActuales / atributos.fotosMaximas) * 100}%` }}
              />
            </div>
          </div>

          {/* Progreso al siguiente plan */}
          {opticaData.plan !== "premium_plus" && (
            <div className="p-4 bg-gold-50 border border-gold-200 rounded-lg">
              <p className="text-sm font-semibold text-navy-900 mb-1">
                {opticaData.plan === "free" ? "Mejora a Premium para desbloquear más características" : "Mejora a Premium+ para acceso total"}
              </p>
              <p className="text-xs text-gray-600 mb-3">
                {opticaData.plan === "free" 
                  ? "Obtén badge verificado, WhatsApp, reseñas Google y estadísticas" 
                  : "Obtén video, reseñas nativas, 12 fotos y acceso B2B"}
              </p>
              <button
                onClick={() => router.push(`/dashboard/${opticaId}/plan`)}
                className="text-xs font-semibold text-gold-700 hover:text-gold-800 flex items-center gap-1"
              >
                Ver planes disponibles
                <TrendingUp className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Información de la cuenta */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Información de la cuenta
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Correo electrónico
              </label>
              <input
                type="email"
                value={opticaData.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                El correo electrónico no se puede cambiar desde aquí. Contacta a soporte si necesitas modificarlo.
              </p>
            </div>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Cambiar contraseña
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nueva contraseña
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              />
            </div>

            <button
              onClick={handleCambiarContrasena}
              className="px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white rounded-[var(--radius-premium)] font-bold text-sm transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Cambiar contraseña
            </button>
          </div>
        </div>

        {/* Preferencias de notificación */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preferencias de notificación
          </h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={opticaData.notificacionesEmail}
                onChange={(e) =>
                  setOpticaData({
                    ...opticaData,
                    notificacionesEmail: e.target.checked,
                  })
                }
                className="w-4 h-4 mt-0.5"
              />
              <div>
                <p className="font-semibold text-gray-700 text-sm">
                  Notificaciones por correo electrónico
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Recibe actualizaciones importantes sobre tu cuenta y suscripción
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={opticaData.notificacionesWhatsApp}
                onChange={(e) =>
                  setOpticaData({
                    ...opticaData,
                    notificacionesWhatsApp: e.target.checked,
                  })
                }
                className="w-4 h-4 mt-0.5"
              />
              <div>
                <p className="font-semibold text-gray-700 text-sm">
                  Notificaciones por WhatsApp
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Recibe alertas rápidas sobre visitas y mensajes
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={opticaData.reporteMensual}
                onChange={(e) =>
                  setOpticaData({
                    ...opticaData,
                    reporteMensual: e.target.checked,
                  })
                }
                className="w-4 h-4 mt-0.5"
              />
              <div>
                <p className="font-semibold text-gray-700 text-sm">
                  Reporte mensual de rendimiento
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Recibe un resumen mensual de las estadísticas de tu óptica
                </p>
              </div>
            </label>

            <button
              onClick={handleGuardarConfiguracion}
              disabled={guardando}
              className="px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white rounded-[var(--radius-premium)] font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar preferencias
                </>
              )}
            </button>
          </div>
        </div>

        {/* Zona de peligro */}
        <div className="card-premium p-6 border-2 border-red-200 bg-red-50">
          <h2 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zona de peligro
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Eliminar cuenta
              </p>
              <p className="text-xs text-gray-600 mb-3">
                Esta acción es irreversible. Se eliminarán todos los datos de tu óptica permanentemente.
              </p>
              <button
                onClick={() => {
                  if (confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
                    alert("Función en desarrollo. Contacta a soporte para eliminar tu cuenta.");
                  }
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-[var(--radius-premium)] font-bold text-sm transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar mi cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}