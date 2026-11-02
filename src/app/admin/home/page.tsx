"use client";

import { useState, useEffect } from "react";
import { Home, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminHome() {
  const [hero, setHero] = useState({ titulo: "", subtitulo: "", textoBoton: "", urlBoton: "" });
  const [badges, setBadges] = useState<any[]>([]);
  const [destacadas, setDestacadas] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const docRef = doc(db, "config", "home");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHero(data.hero || {});
          setBadges(data.badges || []);
          setDestacadas(data.destacadas || []);
        }
      } catch (error) {
        console.error("Error al cargar home:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const actualizarHero = (campo: string, valor: string) => setHero({ ...hero, [campo]: valor });
  
  const guardar = async () => {
    setGuardando(true);
    try {
      const docRef = doc(db, "config", "home");
      await updateDoc(docRef, { hero, badges });
      setMensaje("✅ Cambios del Home guardados exitosamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje("❌ Error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  const agregarDestacada = async (id: string) => {
    if (!id.trim()) return;
    const docRef = doc(db, "config", "home");
    await updateDoc(docRef, { destacadas: arrayUnion(id.trim()) });
    setDestacadas([...destacadas, id.trim()]);
  };

  const eliminarDestacada = async (id: string) => {
    const docRef = doc(db, "config", "home");
    await updateDoc(docRef, { destacadas: arrayRemove(id) });
    setDestacadas(destacadas.filter(d => d !== id));
  };

  if (cargando) return <div className="p-8 text-center text-gray-600">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 font-display mb-2 flex items-center gap-3">
            <Home className="w-8 h-8" />
            Gestión del Home
          </h1>
          <p className="text-gray-600">Edita el contenido de la página principal.</p>
        </div>
        <button onClick={guardar} disabled={guardando} className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 flex items-center gap-2 disabled:opacity-50">
          {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar todo
        </button>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-lg border ${mensaje.includes("✅") ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {mensaje}
        </div>
      )}

      {/* Hero */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <h2 className="font-bold text-navy-900 text-lg">Hero principal</h2>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
          <input type="text" value={hero.titulo} onChange={(e) => actualizarHero("titulo", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Subtítulo</label>
          <textarea value={hero.subtitulo} onChange={(e) => actualizarHero("subtitulo", e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Texto del botón</label>
            <input type="text" value={hero.textoBoton} onChange={(e) => actualizarHero("textoBoton", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">URL del botón</label>
            <input type="text" value={hero.urlBoton} onChange={(e) => actualizarHero("urlBoton", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500" />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <h2 className="font-bold text-navy-900 text-lg">Badges de valor</h2>
        <p className="text-xs text-gray-500">Nota: La edición de badges requiere formulario avanzado. Por ahora se muestran los datos de Firebase.</p>
        <div className="space-y-3">
          {badges.map((badge, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs font-bold text-navy-700">Badge #{i + 1}</span>
              <p className="font-semibold text-navy-900">{badge.titulo}</p>
              <p className="text-sm text-gray-600">{badge.descripcion}</p>
              <p className="text-xs text-gray-500 font-mono">Icono: {badge.icono}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ópticas destacadas */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <h2 className="font-bold text-navy-900 text-lg">Ópticas destacadas (IDs)</h2>
        <div className="space-y-2">
          {destacadas.map((id, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={id} readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm font-mono" />
              <button onClick={() => eliminarDestacada(id)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded border border-red-200">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input 
              type="text" 
              id="nuevaDestacada"
              placeholder="Pegar ID de la óptica..." 
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-navy-500 text-sm font-mono" 
            />
            <button 
              onClick={() => {
                const input = document.getElementById('nuevaDestacada') as HTMLInputElement;
                agregarDestacada(input.value);
                input.value = '';
              }} 
              className="px-4 py-2 bg-navy-900 text-white rounded hover:bg-navy-800 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}