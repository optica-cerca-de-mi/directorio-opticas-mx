"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Edit3, Save, X, Upload,
  AlertTriangle, CheckCircle2, Clock, MapPin, Image as ImageIcon,
  Loader2, Calendar, Eye, ExternalLink
} from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface BannerPublicidad {
  id: string;
  nombre: string;
  ubicacion: string;
  formato: string;
  ancho: number;
  alto: number;
  imagenUrl: string;
  linkDestino: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  notas?: string;
}

const UBICACIONES_DISPONIBLES = [
  {
    id: "home-entre-secciones",
    nombre: "Home - Entre secciones",
    descripcion: "Entre 'Por qué las recomendamos' y 'Todo lo que necesitas'",
    formato: "Horizontal 728x90",
    ancho: 728,
    alto: 90,
  },
  {
    id: "home-footer",
    nombre: "Home - Antes del footer",
    descripcion: "Banner elegante antes del CTA final",
    formato: "Horizontal 1200x250",
    ancho: 1200,
    alto: 250,
  },
  {
    id: "directorio-sidebar",
    nombre: "Directorio - Sidebar",
    descripcion: "Panel lateral del directorio de ópticas",
    formato: "Vertical 300x600",
    ancho: 300,
    alto: 600,
  },
  {
    id: "ficha-entre-contenido",
    nombre: "Ficha - Entre contenido",
    descripcion: "Entre secciones de la ficha pública",
    formato: "Horizontal 728x90",
    ancho: 728,
    alto: 90,
  },
];

export default function AdminPublicidad() {
  const [banners, setBanners] = useState<BannerPublicidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const [formData, setFormData] = useState<Partial<BannerPublicidad>>({
    nombre: "",
    ubicacion: "home-entre-secciones",
    formato: "Horizontal 728x90",
    ancho: 728,
    alto: 90,
    imagenUrl: "",
    linkDestino: "",
    fechaInicio: "",
    fechaFin: "",
    activo: true,
    notas: "",
  });

  useEffect(() => {
    cargarBanners();
  }, []);

  const cargarBanners = async () => {
    try {
      const q = query(collection(db, "banners_publicidad"), orderBy("fechaCreacion", "desc"));
      const snapshot = await getDocs(q);
      const bannersData: BannerPublicidad[] = [];
      snapshot.forEach((doc) => {
        bannersData.push({ id: doc.id, ...doc.data() } as BannerPublicidad);
      });
      setBanners(bannersData);
    } catch (error) {
      console.error("Error al cargar banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen excede 5MB");
      return;
    }

    setSubiendoImagen(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const respuesta = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const datos = await respuesta.json();

      if (respuesta.ok && datos.success) {
        setFormData({ ...formData, imagenUrl: datos.url });
      } else {
        alert(`Error: ${datos.error || "Error desconocido"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error al subir la imagen");
    } finally {
      setSubiendoImagen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGuardar = async () => {
    if (!formData.nombre || !formData.ubicacion || !formData.imagenUrl) {
      alert("Completa los campos obligatorios: nombre, ubicación e imagen");
      return;
    }

    try {
      if (editando) {
        const docRef = doc(db, "banners_publicidad", editando);
        await updateDoc(docRef, {
          ...formData,
          fechaActualizacion: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "banners_publicidad"), {
          ...formData,
          fechaCreacion: serverTimestamp(),
        });
      }

      await cargarBanners();
      resetFormulario();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el banner");
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar este banner?")) return;

    try {
      await deleteDoc(doc(db, "banners_publicidad", id));
      await cargarBanners();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el banner");
    }
  };

  const handleEditar = (banner: BannerPublicidad) => {
    setFormData(banner);
    setEditando(banner.id);
    setMostrandoFormulario(true);
  };

  const resetFormulario = () => {
    setFormData({
      nombre: "",
      ubicacion: "home-entre-secciones",
      formato: "Horizontal 728x90",
      ancho: 728,
      alto: 90,
      imagenUrl: "",
      linkDestino: "",
      fechaInicio: "",
      fechaFin: "",
      activo: true,
      notas: "",
    });
    setEditando(null);
    setMostrandoFormulario(false);
  };

  const getEstadoBanner = (banner: BannerPublicidad) => {
    const hoy = new Date();
    const inicio = banner.fechaInicio ? new Date(banner.fechaInicio) : null;
    const fin = banner.fechaFin ? new Date(banner.fechaFin) : null;

    if (fin && hoy > fin) {
      return { estado: "vencido", color: "bg-red-100 text-red-700", icono: X };
    }
    if (fin && inicio) {
      const diasRestantes = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      if (diasRestantes <= 7) {
        return { estado: `Vence en ${diasRestantes}d`, color: "bg-amber-100 text-amber-700", icono: AlertTriangle };
      }
    }
    if (inicio && hoy < inicio) {
      return { estado: "Programado", color: "bg-blue-100 text-blue-700", icono: Clock };
    }
    return { estado: "Activo", color: "bg-green-100 text-green-700", icono: CheckCircle2 };
  };

  const ubicacionSeleccionada = UBICACIONES_DISPONIBLES.find(u => u.id === formData.ubicacion);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-navy-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="inline-flex items-center gap-2 text-gray-600 hover:text-navy-900">
                <ArrowLeft className="w-4 h-4" />
                Volver al admin
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Gestión de Publicidad
                </h1>
                <p className="text-xs text-gray-500">
                  {banners.length} banners registrados
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetFormulario();
                setMostrandoFormulario(true);
              }}
              className="px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo banner
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Formulario */}
        {mostrandoFormulario && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-navy-900">
                {editando ? "Editar banner" : "Nuevo banner publicitario"}
              </h2>
              <button
                onClick={resetFormulario}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda - Datos */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nombre del banner *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500"
                    placeholder="Ej: Campaña Lentes Ray-Ban Octubre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Ubicación *
                  </label>
                  <select
                    value={formData.ubicacion}
                    onChange={(e) => {
                      const ubicacion = UBICACIONES_DISPONIBLES.find(u => u.id === e.target.value);
                      if (ubicacion) {
                        setFormData({
                          ...formData,
                          ubicacion: e.target.value,
                          formato: ubicacion.formato,
                          ancho: ubicacion.ancho,
                          alto: ubicacion.alto,
                        });
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 bg-white"
                  >
                    {UBICACIONES_DISPONIBLES.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre}
                      </option>
                    ))}
                  </select>
                  {ubicacionSeleccionada && (
                    <p className="text-xs text-gray-500 mt-1">
                      {ubicacionSeleccionada.descripcion}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Formato</label>
                    <input
                      type="text"
                      value={formData.formato}
                      onChange={(e) => setFormData({ ...formData, formato: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Ancho (px)</label>
                    <input
                      type="number"
                      value={formData.ancho}
                      onChange={(e) => setFormData({ ...formData, ancho: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Alto (px)</label>
                    <input
                      type="number"
                      value={formData.alto}
                      onChange={(e) => setFormData({ ...formData, alto: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Link de destino
                  </label>
                  <input
                    type="url"
                    value={formData.linkDestino}
                    onChange={(e) => setFormData({ ...formData, linkDestino: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Fecha fin *
                    </label>
                    <input
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Notas internas
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 resize-none"
                    placeholder="Cliente, contacto, observaciones..."
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Banner activo</p>
                    <p className="text-xs text-gray-500">Desactiva para pausar sin eliminar</p>
                  </div>
                </label>
              </div>

              {/* Columna derecha - Imagen */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Imagen del banner *
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  className="hidden"
                />

                {formData.imagenUrl ? (
                  <div className="space-y-3">
                    <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={formData.imagenUrl}
                        alt="Preview"
                        className="w-full h-auto"
                        style={{ maxHeight: "300px", objectFit: "contain" }}
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white text-sm font-medium rounded-lg shadow hover:bg-gray-100 flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          Cambiar
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imagenUrl: "" })}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg shadow hover:bg-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Quitar
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Tamaño recomendado: {formData.ancho}x{formData.alto}px · Máx 5MB
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-navy-500 transition-colors cursor-pointer"
                  >
                    {subiendoImagen ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-navy-700 animate-spin mb-2" />
                        <p className="text-sm text-gray-700">Subiendo...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-700">Subir imagen del banner</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.ancho}x{formData.alto}px · JPG, PNG · Máx 5MB
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Preview de cómo se verá */}
                {formData.imagenUrl && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Vista previa aproximada
                    </p>
                    <div
                      className="bg-white rounded border border-gray-200 overflow-hidden mx-auto"
                      style={{ maxWidth: "100%", aspectRatio: `${formData.ancho}/${formData.alto}` }}
                    >
                      <img src={formData.imagenUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={resetFormulario}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="px-6 py-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editando ? "Guardar cambios" : "Crear banner"}
              </button>
            </div>
          </div>
        )}

        {/* Lista de banners */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-navy-900">Banners registrados</h2>

          {banners.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 font-semibold mb-1">No hay banners registrados</p>
              <p className="text-sm text-gray-500 mb-4">
                Crea tu primer banner publicitario
              </p>
              <button
                onClick={() => setMostrandoFormulario(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800"
              >
                <Plus className="w-4 h-4" />
                Crear primer banner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((banner) => {
                const estadoInfo = getEstadoBanner(banner);
                const EstadoIcono = estadoInfo.icono;
                const ubicacion = UBICACIONES_DISPONIBLES.find(u => u.id === banner.ubicacion);

                return (
                  <div
                    key={banner.id}
                    className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                      !banner.activo ? "opacity-60 border-gray-200" : "border-gray-200 hover:shadow-md"
                    }`}
                  >
                    {/* Preview imagen */}
                    <div className="bg-gray-100 border-b border-gray-200 relative">
                      {banner.imagenUrl ? (
                        <img
                          src={banner.imagenUrl}
                          alt={banner.nombre}
                          className="w-full h-auto"
                          style={{ maxHeight: "150px", objectFit: "contain" }}
                        />
                      ) : (
                        <div className="h-32 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full flex items-center gap-1 ${estadoInfo.color}`}>
                          <EstadoIcono className="w-2.5 h-2.5" />
                          {estadoInfo.estado}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-navy-900 line-clamp-1">{banner.nombre}</h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditar(banner)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminar(banner.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{ubicacion?.nombre || banner.ubicacion}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <ImageIcon className="w-3 h-3 text-gray-400" />
                          <span>{banner.formato}</span>
                        </div>
                        {banner.fechaInicio && banner.fechaFin && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>
                              {new Date(banner.fechaInicio).toLocaleDateString("es-MX")} -{" "}
                              {new Date(banner.fechaFin).toLocaleDateString("es-MX")}
                            </span>
                          </div>
                        )}
                        {banner.linkDestino && (
                          <a
                            href={banner.linkDestino}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-navy-700 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate">{banner.linkDestino}</span>
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
  );
}