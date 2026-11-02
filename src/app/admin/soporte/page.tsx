"use client";

import { useState, useEffect } from "react";
import { Phone, Mail, Clock, MessageCircle, Save, Loader2 } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminSoporte() {
  const [form, setForm] = useState({
    email: "",
    whatsapp: "",
    telefono: "",
    horarioAtencion: ""
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const docRef = doc(db, "config", "soporte");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setForm(docSnap.data());
        }
      } catch (error) {
        console.error("Error al cargar soporte:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const handleChange = (campo: string, valor: string) => {
    setForm({ ...form, [campo]: valor });
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const docRef = doc(db, "config", "soporte");
      await updateDoc(docRef, form);
      setMensaje("✅ Cambios guardados exitosamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje("❌ Error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="p-8 text-center text-gray-600">Cargando...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 font-display mb-2 flex items-center gap-3">
          <Phone className="w-8 h-8" />
          Configuración de Soporte
        </h1>
        <p className="text-gray-600">Actualiza los datos de contacto y horarios de atención.</p>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-lg border ${mensaje.includes("✅") ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {mensaje}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email de soporte
          </label>
          <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> WhatsApp (con lada, sin +)
          </label>
          <input type="text" value={form.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <Phone className="w-4 h-4" /> Teléfono
          </label>
          <input type="text" value={form.telefono} onChange={(e) => handleChange("telefono", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Horario de atención
          </label>
          <input type="text" value={form.horarioAtencion} onChange={(e) => handleChange("horarioAtencion", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500" />
        </div>

        <button onClick={guardar} disabled={guardando} className="w-full px-4 py-3 bg-navy-900 text-white rounded-lg hover:bg-navy-800 flex items-center justify-center gap-2 font-semibold disabled:opacity-50">
          {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar cambios
        </button>
      </div>
    </div>
  );
}