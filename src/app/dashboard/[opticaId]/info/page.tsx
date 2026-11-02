"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Store,
  MapPin,
  Phone,
  Clock,
  Globe,
  Share2,
  Camera,
  FileText,
} from "lucide-react";

export default function InfoPage() {
  const params = useParams();
  const router = useRouter();
  const opticaId = params.opticaId as string;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    ciudad: "",
    estado: "",
    telefono: "",
    whatsapp: "",
    sitioWeb: "",
    facebook: "",
    instagram: "",
    descripcion: "",
    horarios: "",
  });

  useEffect(() => {
    const cargarOptica = async () => {
      try {
        const docRef = doc(db, "opticas", opticaId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            nombre: data.nombre || "",
            direccion: data.direccion || "",
            ciudad: data.ciudad || "",
            estado: data.estado || "",
            telefono: data.telefono || "",
            whatsapp: data.whatsapp || "",
            sitioWeb: data.sitioWeb || "",
            facebook: data.facebook || "",
            instagram: data.instagram || "",
            descripcion: data.descripcion || "",
            horarios: data.horarios || "",
          });
        }
      } catch (err) {
        console.error("Error al cargar:", err);
        setError("Error al cargar los datos");
      } finally {
        setCargando(false);
      }
    };

    if (opticaId) cargarOptica();
  }, [opticaId]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje("");
    setError("");

    try {
      const docRef = doc(db, "opticas", opticaId);
await setDoc(docRef, {
  ...formData,
  updatedAt: new Date().toISOString(),
}, { merge: true });
      setMensaje("¡Información actualizada correctamente!");
    } catch (err) {
      console.error("Error al guardar:", err);
      setError("Error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-navy-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 font-display mb-2">
          Información de tu óptica
        </h1>
        <p className="text-gray-600">
          Actualiza los datos de tu negocio. Estos se mostrarán en tu ficha pública.
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

      {/* Formulario */}
      <div className="space-y-6">
        {/* Datos básicos */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Store className="w-5 h-5" />
            Datos básicos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nombre de la óptica *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                rows={4}
                placeholder="Describe tu óptica, servicios, experiencia..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Ubicación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Dirección *
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => handleChange("direccion", e.target.value)}
                placeholder="Calle, número, colonia"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Ciudad *
              </label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => handleChange("ciudad", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Estado *
              </label>
              <input
                type="text"
                value={formData.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              />
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contacto
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                placeholder="5551234567"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                WhatsApp
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                placeholder="5551234567"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              />
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horarios
          </h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Horario de atención
            </label>
            <textarea
              value={formData.horarios}
              onChange={(e) => handleChange("horarios", e.target.value)}
              rows={3}
              placeholder="Lunes a Viernes: 9:00 - 19:00&#10;Sábados: 10:00 - 14:00&#10;Domingos: Cerrado"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 resize-none"
            />
          </div>
        </div>

        {/* Redes sociales y web */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Presencia digital
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Globe className="w-4 h-4" />
                Sitio web
              </label>
              <input
                type="url"
                value={formData.sitioWeb}
                onChange={(e) => handleChange("sitioWeb", e.target.value)}
                placeholder="https://mi-optica.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                Facebook
              </label>
              <input
                type="url"
                value={formData.facebook}
                onChange={(e) => handleChange("facebook", e.target.value)}
                placeholder="https://facebook.com/mi-optica"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Camera className="w-4 h-4" />
                Instagram
              </label>
              <input
                type="url"
                value={formData.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
                placeholder="https://instagram.com/mi-optica"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-premium)] focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
              />
            </div>
          </div>
        </div>

        {/* Botón guardar */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => router.push(`/dashboard/${opticaId}`)}
            className="px-6 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-[var(--radius-premium)] hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
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
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}