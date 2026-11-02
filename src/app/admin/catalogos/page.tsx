"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  MapPin, Shield, Star, Plus, Trash2, Loader2, 
  AlertCircle, CheckCircle 
} from "lucide-react";
import { 
  collection, getDocs, addDoc, deleteDoc, doc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─────────────────────────────────────────────────────────────────
// COMPONENTE INTERNO: Contiene toda la lógica que usa useSearchParams
// ─────────────────────────────────────────────────────────────────
function CatalogosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const tab = searchParams.get("tab") || "estados";
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoItem, setNuevoItem] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const colecciones: Record<string, { nombre: string; icono: any; campo: string }> = {
    estados: { nombre: "Estados", icono: MapPin, campo: "nombre" },
    especialidades: { nombre: "Especialidades", icono: Star, campo: "nombre" },
    seguros: { nombre: "Seguros", icono: Shield, campo: "nombre" },
  };

  const config = colecciones[tab] || colecciones.estados;
  const Icono = config.icono;

  useEffect(() => {
    const cargarItems = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, `catalogos_${tab}`));
        setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error al cargar:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarItems();
  }, [tab]);

  const agregarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoItem.trim()) return;

    setGuardando(true);
    try {
      await addDoc(collection(db, `catalogos_${tab}`), {
        [config.campo]: nuevoItem.trim(),
        fecha: new Date().toISOString(),
      });
      setNuevoItem("");
      setMensaje("Agregado correctamente");
      setTimeout(() => setMensaje(""), 3000);
      
      // Recargar lista
      const snapshot = await getDocs(collection(db, `catalogos_${tab}`));
      setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error al agregar:", error);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarItem = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este elemento?")) return;
    try {
      await deleteDoc(doc(db, `catalogos_${tab}`, id));
      setItems(items.filter(item => item.id !== id));
      setMensaje("Eliminado correctamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const cambiarTab = (nuevaTab: string) => {
    router.push(`/admin/catalogos?tab=${nuevaTab}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-navy-900 mb-6 flex items-center gap-3">
        <Icono className="w-8 h-8" />
        Administración de Catálogos
      </h1>

      {/* Tabs de navegación */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {Object.entries(colecciones).map(([key, conf]) => (
          <button
            key={key}
            onClick={() => cambiarTab(key)}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 ${
              tab === key
                ? "bg-navy-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <conf.icono className="w-4 h-4" />
            {conf.nombre}
          </button>
        ))}
      </div>

      {/* Mensajes de éxito */}
      {mensaje && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
          <CheckCircle className="w-5 h-5" />
          {mensaje}
        </div>
      )}

      {/* Formulario para agregar */}
      <form onSubmit={agregarItem} className="mb-8 flex gap-3">
        <input
          type="text"
          value={nuevoItem}
          onChange={(e) => setNuevoItem(e.target.value)}
          placeholder={`Nuevo ${config.nombre.slice(0, -1)}...`}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none"
        />
        <button
          type="submit"
          disabled={guardando || !nuevoItem.trim()}
          className="px-6 py-2 bg-navy-900 text-white rounded-lg font-semibold hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Agregar
        </button>
      </form>

      {/* Lista de items */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-navy-700 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay {config.nombre.toLowerCase()} registrados aún.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900">{item[config.campo]}</span>
                  <button
                    onClick={() => eliminarItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: Envuelve todo en Suspense (SOLUCIÓN DEL ERROR)
// ─────────────────────────────────────────────────────────────────
export default function CatalogosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-navy-700 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando catálogos...</p>
          </div>
        </div>
      }
    >
      <CatalogosContent />
    </Suspense>
  );
}