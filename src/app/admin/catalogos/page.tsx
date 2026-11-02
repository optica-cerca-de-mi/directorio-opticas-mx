"use client";

import { useState, useEffect } from "react";
import { Database, Edit2, Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import { useConfig } from "@/hooks/useConfig";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = 'force-dynamic';

export default function AdminCatalogos() {
  const [catalogoActivo, setCatalogoActivo] = useState<"especialidades" | "seguros" | "estados">("especialidades");
  const [nuevoItem, setNuevoItem] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  const [valorEditado, setValorEditado] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar datos desde Firebase
  const { data, loading, error, refetch } = useConfig(catalogoActivo);
  const items = data?.items || [];

  // Debug: Ver qué está pasando
  useEffect(() => {
    console.log('📊 === DEBUG CATÁLOGOS ===');
    console.log('Catálogo:', catalogoActivo);
    console.log('Data:', data);
    console.log('Items:', items);
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('========================');
  }, [catalogoActivo, data, items, loading, error]);

  // Resetear estado cuando cambia el catálogo
  useEffect(() => {
    setEditando(null);
    setNuevoItem("");
    setMensaje("");
  }, [catalogoActivo]);

  const mostrarMensaje = (msg: string) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(""), 3000);
  };

  const agregarItem = async () => {
    if (!nuevoItem.trim()) return;
    
    setGuardando(true);
    try {
      const docRef = doc(db, "config", catalogoActivo);
      await updateDoc(docRef, {
        items: arrayUnion(nuevoItem.trim())
      });
      
      mostrarMensaje(`✅ "${nuevoItem}" agregado exitosamente`);
      setNuevoItem("");
      refetch();
    } catch (error) {
      console.error("Error al agregar:", error);
      mostrarMensaje(" Error al agregar el item");
    } finally {
      setGuardando(false);
    }
  };

  const iniciarEdicion = (index: number, valor: string) => {
    setEditando(index);
    setValorEditado(valor);
  };

  const guardarEdicion = async () => {
    if (!valorEditado.trim() || editando === null) return;
    
    const valorOriginal = items[editando];
    
    setGuardando(true);
    try {
      const docRef = doc(db, "config", catalogoActivo);
      
      await updateDoc(docRef, {
        items: arrayRemove(valorOriginal)
      });
      
      await updateDoc(docRef, {
        items: arrayUnion(valorEditado.trim())
      });
      
      mostrarMensaje(`✅ Item actualizado exitosamente`);
      setEditando(null);
      refetch();
    } catch (error) {
      console.error("Error al actualizar:", error);
      mostrarMensaje("❌ Error al actualizar el item");
    } finally {
      setGuardando(false);
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setValorEditado("");
  };

  const eliminarItem = async (index: number) => {
    const item = items[index];
    if (!confirm(`¿Eliminar "${item}"?`)) return;
    
    setGuardando(true);
    try {
      const docRef = doc(db, "config", catalogoActivo);
      await updateDoc(docRef, {
        items: arrayRemove(item)
      });
      
      mostrarMensaje(`🗑️ "${item}" eliminado exitosamente`);
      refetch();
    } catch (error) {
      console.error("Error al eliminar:", error);
      mostrarMensaje("❌ Error al eliminar el item");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 font-display mb-2 flex items-center gap-3">
          <Database className="w-8 h-8" />
          Gestión de Catálogos
        </h1>
        <p className="text-gray-600">
          Administra los catálogos de especialidades, seguros y estados.
        </p>
      </div>

      {/* Mensaje de feedback */}
      {mensaje && (
        <div className={`p-4 rounded-lg border ${
          mensaje.includes("✅") || mensaje.includes("🗑️") 
            ? "bg-green-50 border-green-200 text-green-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {mensaje}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["especialidades", "seguros", "estados"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCatalogoActivo(cat)}
            className={`px-4 py-3 text-sm font-semibold capitalize transition-colors ${
              catalogoActivo === cat
                ? "border-b-2 border-navy-900 text-navy-900"
                : "text-gray-500 hover:text-navy-700"
            }`}
          >
            {cat}
            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
              {cat === catalogoActivo && !loading ? items.length : "..."}
            </span>
          </button>
        ))}
      </div>

      {/* Agregar nuevo */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevoItem}
            onChange={(e) => setNuevoItem(e.target.value)}
            placeholder={`Agregar nuevo ${catalogoActivo.slice(0, -1)}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500"
            onKeyPress={(e) => e.key === "Enter" && agregarItem()}
            disabled={guardando}
          />
          <button
            onClick={agregarItem}
            disabled={guardando || !nuevoItem.trim()}
            className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Agregar
          </button>
        </div>
      </div>

      {/* Lista - CON MEJOR MANEJO DE ESTADOS */}
      {loading ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <Loader2 className="w-8 h-8 text-navy-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando {catalogoActivo}...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
          <p className="text-red-700 mb-2">❌ Error al cargar los datos</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800"
          >
            Reintentar
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No hay {catalogoActivo} registrados</p>
          <p className="text-xs text-gray-500">
            Revisa la consola del navegador (F12) para ver detalles
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {items.map((item: string, i: number) => (
              <div key={i} className="p-4 flex items-center gap-3 hover:bg-gray-50">
                <span className="w-8 h-8 bg-navy-100 text-navy-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                
                {editando === i ? (
                  <input
                    type="text"
                    value={valorEditado}
                    onChange={(e) => setValorEditado(e.target.value)}
                    className="flex-1 px-3 py-2 border border-navy-500 rounded focus:outline-none"
                    autoFocus
                    disabled={guardando}
                  />
                ) : (
                  <span className="flex-1 text-gray-700">{item}</span>
                )}

                <div className="flex gap-1">
                  {editando === i ? (
                    <>
                      <button
                        onClick={guardarEdicion}
                        disabled={guardando}
                        className="p-2 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                      >
                        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        disabled={guardando}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => iniciarEdicion(i, item)}
                        disabled={guardando}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminarItem(i)}
                        disabled={guardando}
                        className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                      >
                        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}