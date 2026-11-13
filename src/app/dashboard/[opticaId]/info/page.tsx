"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Save, Loader2, CheckCircle, AlertCircle, Store, MapPin, Phone,
  Clock, Globe, Share2, Camera, Calendar, LocateFixed,
} from "lucide-react";

// Valores que pertenecen al ciclo de vida de la cuenta, NO al estado geográfico
const ESTADOS_DE_CUENTA = ["activa", "inactivo", "inactiva", "eliminada", "pendiente", "vencido"];

export default function InfoPage() {
  const params = useParams();
  const router = useRouter();
  const opticaId = params.opticaId as string;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [needsGeocoding, setNeedsGeocoding] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    ciudad: "",
    estadoGeografico: "",   // ✅ NUEVO: estado de ubicación
    cp: "",                 // ✅ NUEVO
    telefono: "",
    whatsapp: "",
    sitioWeb: "",
    facebook: "",
    instagram: "",
    descripcion: "",
    horarios: "",
    linkAgenda: "",
    latitud: null as number | null,
    longitud: null as number | null,
  });

  useEffect(() => {
    const cargarOptica = async () => {
      try {
        const docRef = doc(db, "opticas", opticaId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // ✅ Horarios: convertir array de objetos a texto legible
          const horariosTexto = Array.isArray(data.horarios)
            ? data.horarios
                .map((h: any) => `${h.dia}: ${h.cerrado ? "Cerrado" : `${h.apertura} - ${h.cierre}`}`)
                .join("\n")
            : (data.horarios || "");

          // ✅ Estado geográfico: usa estadoGeografico; si no existe, toma estado SOLO si no es un valor de cuenta
          const estadoGeo =
            data.estadoGeografico ||
            (ESTADOS_DE_CUENTA.includes(String(data.estado || "").toLowerCase()) ? "" : data.estado || "");

          setFormData({
            nombre: data.nombre || "",
            direccion: data.direccion || "",
            ciudad: data.ciudad || "",
            estadoGeografico: estadoGeo,
            cp: data.cp || "",
            telefono: data.telefono || "",
            whatsapp: data.whatsapp || "",
            sitioWeb: data.sitioWeb || "",
            facebook: data.facebook || "",
            instagram: data.instagram || "",
            descripcion: data.descripcion || "",
            horarios: horariosTexto,
            linkAgenda: data.linkAgenda || "",
            latitud: data.latitud || null,
            longitud: data.longitud || null,
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
    if (["direccion", "ciudad", "estadoGeografico", "cp"].includes(field)) {
      setNeedsGeocoding(true);
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje("");
    setError("");
    try {
      let dataToSave = { ...formData };

      // ✅ Geocoding con el estado geográfico CORRECTO (no "activa")
      if (needsGeocoding && (formData.direccion || formData.ciudad)) {
        try {
          const response = await fetch("/api/geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              direccion: formData.direccion,
              ciudad: formData.ciudad,
              estado: formData.estadoGeografico,   // ✅ aquí va el geográfico
              cp: formData.cp,
            }),
          });
          const geoData = await response.json();
          if (geoData.success && geoData.latitud && geoData.longitud) {
            dataToSave.latitud = geoData.latitud;
            dataToSave.longitud = geoData.longitud;
            setNeedsGeocoding(false);
          }
        } catch (err) {
          console.error("Error al geocodificar:", err);
        }
      }

      const docRef = doc(db, "opticas", opticaId);
      // ✅ Guardamos estadoGeografico; NO tocamos 'estado' (se preserva "activa" por merge)
      await setDoc(
        docRef,
        {
          ...dataToSave,
          estadoGeografico: formData.estadoGeografico,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 font-display mb-2">Información de tu óptica</h1>
        <p className="text-gray-600">Actualiza los datos de tu negocio. Estos se mostrarán en tu ficha pública.</p>
      </div>

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
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2"><Store className="w-5 h-5" />Datos básicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre de la óptica *</label>
              <input type="text" value={formData.nombre} onChange={(e) => handleChange("nombre", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descripción</label>
              <textarea value={formData.descripcion} onChange={(e) => handleChange("descripcion", e.target.value)} rows={4}
                placeholder="Describe tu óptica, servicios, experiencia..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 resize-none" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" />Ubicación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dirección *</label>
              <input type="text" value={formData.direccion} onChange={(e) => handleChange("direccion", e.target.value)}
                placeholder="Calle, número, colonia"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ciudad *</label>
              <input type="text" value={formData.ciudad} onChange={(e) => handleChange("ciudad", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estado (geográfico) *</label>
              <input type="text" value={formData.estadoGeografico} onChange={(e) => handleChange("estadoGeografico", e.target.value)}
                placeholder="Ej: Estado de México"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Código Postal</label>
              <input type="text" value={formData.cp} onChange={(e) => handleChange("cp", e.target.value)}
                placeholder="Ej: 54700"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" />
            </div>
            <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <LocateFixed className="w-4 h-4 text-navy-700" />
                <span className="text-sm font-semibold text-gray-700">Coordenadas GPS</span>
                {needsGeocoding && <span className="text-xs text-amber-600 font-medium">(Se actualizarán al guardar)</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-xs text-gray-500">Latitud</span>
                  <p className="text-sm font-mono text-navy-900">{formData.latitud ? formData.latitud.toFixed(6) : "No geocodificado"}</p></div>
                <div><span className="text-xs text-gray-500">Longitud</span>
                  <p className="text-sm font-mono text-navy-900">{formData.longitud ? formData.longitud.toFixed(6) : "No geocodificado"}</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2"><Phone className="w-5 h-5" />Contacto y Agenda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
              <input type="tel" value={formData.telefono} onChange={(e) => handleChange("telefono", e.target.value)} placeholder="5551234567"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
              <input type="tel" value={formData.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)} placeholder="5551234567"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" /></div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Calendar className="w-4 h-4 text-navy-700" />Link de Agenda Externa (Opcional)</label>
              <input type="url" value={formData.linkAgenda} onChange={(e) => handleChange("linkAgenda", e.target.value)}
                placeholder="https://calendly.com/tu-optica o https://doctoralia.com.mx/..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" />
              <p className="text-xs text-gray-500 mt-1">Si usas Calendly, Doctoralia u otra plataforma, pega el link aquí para que tus clientes reserven directamente.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5" />Horarios</h2>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Horario de atención (texto)</label>
          <textarea value={formData.horarios} onChange={(e) => handleChange("horarios", e.target.value)} rows={3}
            placeholder="Lunes a Viernes: 9:00 - 19:00&#10;Sábados: 10:00 - 14:00&#10;Domingos: Cerrado"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 resize-none" />
          <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />
            Para gestionar horarios por día con apertura/cierre, usa la sección <strong>Diseña tu Ficha</strong>.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2"><Globe className="w-5 h-5" />Presencia digital</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><Globe className="w-4 h-4" />Sitio web</label>
              <input type="url" value={formData.sitioWeb} onChange={(e) => handleChange("sitioWeb", e.target.value)} placeholder="https://mi-optica.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><Share2 className="w-4 h-4" />Facebook</label>
              <input type="url" value={formData.facebook} onChange={(e) => handleChange("facebook", e.target.value)} placeholder="https://facebook.com/mi-optica"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><Camera className="w-4 h-4" />Instagram</label>
              <input type="url" value={formData.instagram} onChange={(e) => handleChange("instagram", e.target.value)} placeholder="https://instagram.com/mi-optica"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" /></div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={() => router.push(`/dashboard/${opticaId}`)}
            className="px-6 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando}
            className="px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {guardando ? (<><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>) : (<><Save className="w-4 h-4" />Guardar cambios</>)}
          </button>
        </div>
      </div>
    </div>
  );
}