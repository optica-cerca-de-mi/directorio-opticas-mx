"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";

// Tipo flexible para manejar ambos formatos
type Foto = string | { url: string; publicId?: string; caption?: string };

export default function GaleriaPage() {
  const params = useParams();
  const opticaId = params.opticaId as string;

  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [plan, setPlan] = useState("");

  useEffect(() => {
    const cargarOptica = async () => {
      try {
        const docRef = doc(db, "opticas", opticaId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFotos(data.fotos || []);
          setPlan(data.plan || "free");
        }
      } catch (err) {
        console.error("Error al cargar:", err);
        setError("Error al cargar la galería");
      } finally {
        setCargando(false);
      }
    };

    if (opticaId) cargarOptica();
  }, [opticaId]);

  const maxFotos = plan === "premium_plus" ? 15 : plan === "premium" ? 8 : 3;

  // Helper para obtener URL de una foto (maneja string u objeto)
  const getFotoUrl = (foto: Foto): string => {
    if (typeof foto === 'string') return foto;
    return foto?.url || '';
  };

  // Helper para obtener publicId de una foto
  const getFotoPublicId = (foto: Foto): string => {
    if (typeof foto === 'string') return '';
    return foto?.publicId || '';
  };

  const subirFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files || []);
    if (archivos.length === 0) return;

    const espaciosDisponibles = maxFotos - fotos.length;
    if (espaciosDisponibles <= 0) {
      setError(`Ya alcanzaste el límite de ${maxFotos} fotos`);
      return;
    }

    const archivosAProcesar = archivos.slice(0, espaciosDisponibles);
    setSubiendo(true);
    setError("");
    setMensaje("");

    const nuevasFotos: Foto[] = [];

    for (const archivo of archivosAProcesar) {
      try {
        const formData = new FormData();
        formData.append("file", archivo);

        const respuesta = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const datos = await respuesta.json();

        if (respuesta.ok && datos.success) {
          // ✅ NUEVO: Guardar objeto completo con publicId
          nuevasFotos.push({ 
            url: datos.url, 
            publicId: datos.publicId || '',
            caption: ''
          });
        } else {
          setError(`Error al subir ${archivo.name}`);
        }
      } catch (err) {
        console.error(err);
        setError(`Error de conexión al subir ${archivo.name}`);
      }
    }

    if (nuevasFotos.length > 0) {
      const fotosActualizadas = [...fotos, ...nuevasFotos];
      setFotos(fotosActualizadas);

      try {
        const docRef = doc(db, "opticas", opticaId);
        await setDoc(docRef, { fotos: fotosActualizadas }, { merge: true });
        setMensaje(`${nuevasFotos.length} foto(s) subida(s) correctamente`);
      } catch (err) {
        console.error("Error al guardar en Firestore:", err);
        setError("Las fotos se subieron pero no se guardaron en la base de datos");
      }
    }

    setSubiendo(false);
    e.target.value = "";
  };

  const eliminarFoto = async (index: number) => {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) return;

    const fotoAEliminar = fotos[index];
    const publicId = getFotoPublicId(fotoAEliminar);
    const nuevasFotos = fotos.filter((_, i) => i !== index);
    
    // Actualizar el estado local inmediatamente (para mejor UX)
    setFotos(nuevasFotos);

    try {
      // 1. Borrar de Cloudinary si tiene publicId
      if (publicId) {
        const respuestaDelete = await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId }),
        });

        const datosDelete = await respuestaDelete.json();

        if (!respuestaDelete.ok) {
          console.warn("No se pudo borrar de Cloudinary:", datosDelete.error);
        }
      }

      // 2. Actualizar Firestore
      const docRef = doc(db, "opticas", opticaId);
      await setDoc(docRef, { fotos: nuevasFotos }, { merge: true });
      
      setMensaje("Foto eliminada correctamente");
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError("Error al eliminar la foto");
      // Revertir el cambio en caso de error
      setFotos(fotos);
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
          Galería de fotos
        </h1>
        <p className="text-gray-600">
          Sube fotos de tu óptica para atraer más clientes.
          {plan === "premium_plus" ? " (Hasta 15 fotos)" : plan === "premium" ? " (Hasta 8 fotos)" : " (Hasta 3 fotos)"}
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

      {/* Contador de fotos */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          {fotos.length} de {maxFotos} fotos utilizadas
        </p>
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-navy-700 transition-all"
            style={{ width: `${(fotos.length / maxFotos) * 100}%` }}
          />
        </div>
      </div>

      {/* Grid de fotos */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {fotos.map((foto, index) => {
            const fotoUrl = getFotoUrl(foto);
            
            return (
              <div key={index} className="relative group aspect-square">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      console.error(`Error al cargar imagen: ${fotoUrl}`);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => eliminarFoto(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  #{index + 1}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Zona de subida */}
      {fotos.length < maxFotos && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-navy-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={subirFotos}
            disabled={subiendo}
            className="hidden"
            id="file-input-galeria"
          />
          <label htmlFor="file-input-galeria" className="cursor-pointer">
            {subiendo ? (
              <>
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-600">Subiendo fotos...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Haz clic para subir fotos
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WEBP (máx 5MB cada una)
                </p>
              </>
            )}
          </label>
        </div>
      )}

      {fotos.length >= maxFotos && (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-sm font-medium text-yellow-900">
            Has alcanzado el límite de {maxFotos} fotos para tu plan actual.
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Mejora tu plan para subir más fotos.
          </p>
        </div>
      )}
    </div>
  );
}