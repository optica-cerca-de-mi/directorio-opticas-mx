"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Clock, Phone, MessageCircle,
  Mail, MapPin, Star, ShieldCheck, Lock, Sparkles, Image as ImageIcon,
  Video, Palette, Crown, AlertCircle, Upload, X, Plus, Eye,
  GripVertical, Trash2, Edit3, Save, Calendar, Tag, TrendingUp,
  ChevronUp, ChevronDown, Copy, Type, HelpCircle, Megaphone
} from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPlanConfig, PlanType } from "@/lib/plans-config";
import Editor from "@/components/Editor";
import { deleteImageFromCloudinary } from "@/lib/cloudinary";
import UploadVideo from "@/components/UploadVideo";
import OptiRelevanceCard from "@/components/dashboard/OptiRelevanceCard";

// ────────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────────

interface Horario {
  dia: string;
  apertura: string;
  cierre: string;
  cerrado: boolean;
}

interface FotoObjeto {
  url: string;
  publicId?: string;
  caption?: string;
}

type Foto = string | FotoObjeto;

interface ProductoDestacado {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio?: string;
  link?: string;
}

interface Promocion {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio?: string;
  fechaFin?: string;
  activa: boolean;
}

interface HeroConfig {
  imagen: string | { url: string; publicId?: string };
  colorOverlay: string;
  titulo: string;
  subtitulo: string;
}

interface BloqueContenido {
  id: string;
  tipo: 'texto' | 'imagen_texto' | 'video' | 'faq' | 'galeria' | 'banner';
  orden: number;
  datos: {
    titulo?: string;
    contenido?: string;
    imagen?: string;
    videoUrl?: string;
    layout?: 'izquierda' | 'derecha' | 'centro';
    preguntas?: Array<{ pregunta: string; respuesta: string }>;
    imagenes?: string[];
    ctaText?: string;
    ctaLink?: string;
    colorFondo?: string;
    colorTexto?: string;
  };
}

interface OpticaData {
  id: string;
  nombreComercial: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  cp?: string;
  plan?: PlanType;
  descripcion?: string;
  especialidades?: string[];
  especialidadesPersonalizadas?: string[]; // ✅ NUEVO: Para planes Premium/Premium+
  segurosAceptados?: string[];
  horarios?: Horario[];
  fotos?: Foto[];
  videos?: string[];
  videoCloudinary?: {
    url: string;
    publicId: string;
  };
  calificacionGoogle?: number;
  numResenas?: number;
  urlGoogleMaps?: string;
  sitioWeb?: string;
  facebook?: string;
  instagram?: string;
  logo?: string;
  hero?: HeroConfig;
  productosDestacados?: ProductoDestacado[];
  promociones?: Promocion[];
  bloquesContenido?: BloqueContenido[];
  resenasGoogle?: any;
  verificada?: boolean;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";
type SeccionActiva = "hero" | "info" | "galeria" | "video" | "productos" | "promos" | "horarios" | "especialidades" | "contenido";

type ImageUploadData = string | { url: string; publicId?: string };

// ────────────────────────────────────────────────────────────────────────────────
// FUNCIONES AUXILIARES
// ────────────────────────────────────────────────────────────────────────────────

function sanitizeForFirebase(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirebase);

  const result: any = {};
  for (const key in obj) {
    if (obj[key] === undefined) {
      result[key] = null;
    } else if (typeof obj[key] === 'object') {
      result[key] = sanitizeForFirebase(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }
  if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  }
  return null;
}

const getImageUrl = (data: ImageUploadData): string => {
  return typeof data === 'string' ? data : (data?.url || '');
};

const getFotoUrl = (foto: Foto): string => {
  if (typeof foto === 'string') return foto;
  return foto?.url || '';
};

const getFotoCaption = (foto: Foto): string => {
  if (typeof foto === 'string') return '';
  return foto?.caption || '';
};

const getFotoPublicId = (foto: Foto): string => {
  if (typeof foto === 'string') return '';
  return foto?.publicId || '';
};

const getHeroImagenUrl = (imagen: string | { url: string; publicId?: string } | undefined): string => {
  if (!imagen) return '';
  if (typeof imagen === 'string') return imagen;
  return imagen?.url || '';
};

// ────────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Upload de imagen
// ────────────────────────────────────────────────────────────────────────────────

function UploadImagen({
  value,
  onChange,
  label = "Subir imagen",
  recomendacion = "JPG, PNG (máx 5MB)",
  onRemove
}: {
  value?: ImageUploadData;
  onChange: (data: ImageUploadData) => void;
  label?: string;
  recomendacion?: string;
  onRemove?: (publicId: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [needsGeocoding, setNeedsGeocoding] = useState(false);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo excede 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const respuesta = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const datos = await respuesta.json();

      if (respuesta.ok && datos.success) {
        onChange({
          url: datos.url,
          publicId: datos.publicId || ""
        });
      } else {
        alert(`Error al subir: ${datos.error || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al subir');
    } finally {
      setUploading(false);
    }
  };

  const currentUrl = getImageUrl(value);
  const currentPublicId = typeof value === 'string' ? '' : (value?.publicId || '');

  const handleRemove = () => {
    if (currentPublicId && onRemove) {
      onRemove(currentPublicId);
    }
    onChange('');
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
        className="hidden"
      />
      {currentUrl ? (
        <div className="relative">
          <img src={currentUrl} alt="" className="max-h-64 rounded-lg border border-gray-200" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 text-sm text-navy-700 hover:underline"
          >
            Cambiar imagen
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-navy-500 transition-colors cursor-pointer"
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-navy-700 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-700">Subiendo...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">{label}</p>
              <p className="text-xs text-gray-500 mt-1">{recomendacion}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// COMPONENTES AUXILIARES
// ────────────────────────────────────────────────────────────────────────────────

function LockedField({ feature, requiredPlan, opticaId }: { feature: string; requiredPlan: string; opticaId: string }) {
  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 min-h-[200px] flex items-center justify-center">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
        <div className="text-center px-6">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="font-bold text-gray-700 mb-2 text-lg">{feature}</p>
          <p className="text-sm text-gray-500 mb-4">
            Disponible en el plan <span className="font-bold text-navy-900">{requiredPlan}</span>
          </p>
          <Link
            href={`/dashboard/${opticaId}/plan`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-navy-900 to-navy-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <Crown className="w-4 h-4" />
            Mejorar plan
          </Link>
        </div>
      </div>
    </div>
  );
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const porcentaje = (current / max) * 100;
  let color = "text-gray-500";
  if (porcentaje >= 90) color = "text-red-600 font-semibold";
  else if (porcentaje >= 75) color = "text-amber-600 font-medium";
  else if (porcentaje > 0) color = "text-green-600";

  return (
    <span className={`text-xs ${color}`}>
      {current}/{max} caracteres
    </span>
  );
}

function AutoSaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  return (
    <div className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-lg shadow-2xl px-5 py-4 flex items-center gap-3 z-50">
      {status === "saving" && (
        <>
          <div className="w-5 h-5 border-2 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-700 font-medium">Guardando cambios...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-700 font-semibold">Cambios guardados</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700 font-semibold">Error al guardar</span>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// DATOS MAESTROS
// ────────────────────────────────────────────────────────────────────────────────

// ✅ ESPECIALIDADES GENÉRICAS (Disponibles para todos los planes)
const ESPECIALIDADES_GENERICAS = [
  "Optometría General",
  "Lentes de Contacto",
  "Lentes Progresivos",
  "Lentes Antiblue",
  "Examen de la Vista",
  "Lentes Solares"
];

const SEGUROS_DISPONIBLES = ["AUNA", "GNP Seguros", "MetLife", "AXA", "Seguros Monterrey", "Zurich", "Allianz"];

const HORARIOS_INICIALES: Horario[] = [
  { dia: "Lunes", apertura: "09:00", cierre: "19:00", cerrado: false },
  { dia: "Martes", apertura: "09:00", cierre: "19:00", cerrado: false },
  { dia: "Miércoles", apertura: "09:00", cierre: "19:00", cerrado: false },
  { dia: "Jueves", apertura: "09:00", cierre: "19:00", cerrado: false },
  { dia: "Viernes", apertura: "09:00", cierre: "19:00", cerrado: false },
  { dia: "Sábado", apertura: "10:00", cierre: "15:00", cerrado: false },
  { dia: "Domingo", apertura: "00:00", cierre: "00:00", cerrado: true }
];

const TIPOS_BLOQUE = [
  { tipo: 'texto' as const, label: 'Texto enriquecido', icon: Type, descripcion: 'Negritas, cursivas, listas, encabezados' },
  { tipo: 'imagen_texto' as const, label: 'Imagen + Texto', icon: ImageIcon, descripcion: 'Imagen lateral con texto descriptivo' },
  { tipo: 'video' as const, label: 'Video', icon: Video, descripcion: 'YouTube o Vimeo embebido' },
  { tipo: 'faq' as const, label: 'Preguntas frecuentes', icon: HelpCircle, descripcion: 'Q&A colapsable' },
  { tipo: 'galeria' as const, label: 'Galería temática', icon: ImageIcon, descripcion: 'Carrusel de imágenes con título' },
  { tipo: 'banner' as const, label: 'Banner promocional', icon: Megaphone, descripcion: 'Banner con CTA y colores personalizados' },
];

// ────────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────────

export default function DisenarFicha() {
  const params = useParams();
  const router = useRouter();
  const [optica, setOptica] = useState<OpticaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasChanges, setHasChanges] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<SeccionActiva>("hero");
  const [bloqueEditando, setBloqueEditando] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  
    // ✅ Estado para especialidades personalizadas
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ 1. ESTADO PARA GEOCODING
  const [needsGeocoding, setNeedsGeocoding] = useState(false);

  // Carga inicial de datos
  useEffect(() => {
    const cargarDatos = async () => {
      if (!params.opticaId) return;
      try {
        const docRef = doc(db, "opticas", params.opticaId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as OpticaData;
          if (!data.horarios || data.horarios.length === 0) data.horarios = HORARIOS_INICIALES;
          if (!data.fotos) data.fotos = [];
          if (!data.productosDestacados) data.productosDestacados = [];
          if (!data.promociones) data.promociones = [];
          if (!data.hero) data.hero = { imagen: "", colorOverlay: "#000000", titulo: "", subtitulo: "" };
          if (!data.bloquesContenido) data.bloquesContenido = [];
          if (!data.especialidadesPersonalizadas) data.especialidadesPersonalizadas = [];
          setOptica(data);
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error al cargar:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [params.opticaId, router]);

  // ✅ 2. FUNCIÓN updateField (con detección de cambios de ubicación)
  const updateField = useCallback((field: keyof OpticaData, value: any) => {
    setOptica(prev => prev ? { ...prev, [field]: value } : null);
    setHasChanges(true);
    
    if (['direccion', 'ciudad', 'estado', 'cp'].includes(field)) {
      setNeedsGeocoding(true);
    }
  }, []);

  const eliminarFotoGaleria = useCallback(async (index: number) => {
    const fotoAEliminar = optica?.fotos?.[index];
    const publicId = getFotoPublicId(fotoAEliminar);

    if (publicId) {
      await deleteImageFromCloudinary(publicId);
    }

    const nuevasFotos = optica?.fotos?.filter((_, i) => i !== index);
    updateField("fotos", nuevasFotos);
  }, [optica?.fotos, updateField]);

  // ✅ 3. FUNCIÓN UNIFICADA DE GUARDADO CON GEOCODING
  const ejecutarGuardado = useCallback(async (datos: any) => {
    let dataToSave = { ...datos };
    const { id, ...rest } = dataToSave;

    if (needsGeocoding && (rest.direccion || rest.ciudad)) {
      try {
        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            direccion: rest.direccion,
            ciudad: rest.ciudad,
            estado: rest.estado,
            cp: rest.cp
          })
        });
        const geoData = await response.json();
        
        if (geoData.success && geoData.latitud && geoData.longitud) {
          rest.latitud = geoData.latitud;
          rest.longitud = geoData.longitud;
          setNeedsGeocoding(false);
        }
      } catch (error) {
        console.error("Error al geocodificar:", error);
      }
    }

    const docRef = doc(db, "opticas", datos.id);
    const sanitizedData = sanitizeForFirebase(rest);
    await updateDoc(docRef, sanitizedData);
  }, [needsGeocoding]);

  // ✅ 4. AUTO-GUARDADO
  useEffect(() => {
    if (!hasChanges || !optica) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    setSaveStatus("saving");
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await ejecutarGuardado(optica);
        setSaveStatus("saved");
        setHasChanges(false);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error: any) {
        console.error("❌ Error al guardar:", error);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    }, 2500);

    return () => { 
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); 
    };
  }, [optica, hasChanges, ejecutarGuardado]);

  // ✅ 5. GUARDADO MANUAL
  const guardarManual = async () => {
    if (!optica) return;
    try {
      setSaveStatus("saving");
      await ejecutarGuardado(optica);
      setSaveStatus("saved");
      setHasChanges(false);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const planConfig = optica?.plan ? getPlanConfig(optica.plan as PlanType) : null;
  const updateField = useCallback((field: keyof OpticaData, value: any) => {
    setOptica(prev => prev ? { ...prev, [field]: value } : null);
    setHasChanges(true);
    
    // ✅ Marcar para geocoding si cambia algún campo de ubicación
    if (['direccion', 'ciudad', 'estado', 'cp'].includes(field)) {
      setNeedsGeocoding(true);
    }
  }, []);

  const eliminarFotoGaleria = useCallback(async (index: number) => {
    const fotoAEliminar = optica?.fotos?.[index];
    const publicId = getFotoPublicId(fotoAEliminar);

    if (publicId) {
      await deleteImageFromCloudinary(publicId);
    }

    const nuevasFotos = optica?.fotos?.filter((_, i) => i !== index);
    updateField("fotos", nuevasFotos);
  }, [optica?.fotos, updateField]);

  // ✅ FUNCIÓN UNIFICADA DE GUARDADO CON GEOCODING AUTOMÁTICO
  const ejecutarGuardado = useCallback(async (datos: any) => {
    let dataToSave = { ...datos };
    const { id, ...rest } = dataToSave;

    // 1. Geocoding si es necesario
    if (needsGeocoding) {
      try {
        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            direccion: rest.direccion,
            ciudad: rest.ciudad,
            estado: rest.estado,
            cp: rest.cp
          })
        });
        const geoData = await response.json();
        
        if (geoData.success && geoData.latitud && geoData.longitud) {
          rest.latitud = geoData.latitud;
          rest.longitud = geoData.longitud;
          setNeedsGeocoding(false); // Ya geocodificamos, resetear flag
        }
      } catch (error) {
        console.error("Error al geocodificar:", error);
        // Continuamos con el guardado aunque falle el geocoding para no bloquear al usuario
      }
    }

    // 2. Guardar en Firestore
    const docRef = doc(db, "opticas", datos.id);
    const sanitizedData = sanitizeForFirebase(rest);
    await updateDoc(docRef, sanitizedData);
  }, [needsGeocoding]);

const updateField = ...
const eliminarFotoGaleria = ...
const ejecutarGuardado = useCallback(...)
  ...
}, [needsGeocoding]);

const guardarManual = async () => { ... }

useEffect(() => {
  if (!hasChanges || !optica) return;
  ...
}, [optica, hasChanges, ejecutarGuardado]);

  const guardarManual = async () => {
    if (!optica) return;
    try {
      setSaveStatus("saving");
      await ejecutarGuardado(optica);
      setSaveStatus("saved");
      setHasChanges(false);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const agregarBloque = (tipo: BloqueContenido['tipo']) => {
    const nuevoBloque: BloqueContenido = {
      id: `bloque_${Date.now()}`,
      tipo,
      orden: (optica?.bloquesContenido?.length || 0),
      datos: {
        titulo: '',
        contenido: '',
        layout: 'izquierda',
        preguntas: tipo === 'faq' ? [{ pregunta: '', respuesta: '' }] : undefined,
        imagenes: tipo === 'galeria' ? [] : undefined,
        colorFondo: tipo === 'banner' ? '#1e3a8a' : undefined,
        colorTexto: tipo === 'banner' ? '#ffffff' : undefined,
      }
    };
    updateField("bloquesContenido", [...(optica?.bloquesContenido || []), nuevoBloque]);
    setBloqueEditando(nuevoBloque.id);
  };

  const actualizarBloque = (bloqueId: string, datos: Partial<BloqueContenido['datos']>) => {
    const nuevosBloques = optica?.bloquesContenido?.map(b =>
      b.id === bloqueId ? { ...b, datos: { ...b.datos, ...datos } } : b
    ) || [];
    updateField("bloquesContenido", nuevosBloques);
  };

  const eliminarBloque = (bloqueId: string) => {
    updateField("bloquesContenido", optica?.bloquesContenido?.filter(b => b.id !== bloqueId) || []);
  };

  const moverBloque = (bloqueId: string, direccion: 'up' | 'down') => {
    const bloques = optica?.bloquesContenido || [];
    const index = bloques.findIndex(b => b.id === bloqueId);
    if (index === -1) return;
    if (direccion === 'up' && index > 0) {
      const nuevos = [...bloques];
      [nuevos[index - 1], nuevos[index]] = [nuevos[index], nuevos[index - 1]];
      updateField("bloquesContenido", nuevos);
    } else if (direccion === 'down' && index < bloques.length - 1) {
      const nuevos = [...bloques];
      [nuevos[index], nuevos[index + 1]] = [nuevos[index + 1], nuevos[index]];
      updateField("bloquesContenido", nuevos);
    }
  };

  const duplicarBloque = (bloqueId: string) => {
    const bloque = optica?.bloquesContenido?.find(b => b.id === bloqueId);
    if (!bloque) return;
    const nuevoBloque = { ...bloque, id: `bloque_${Date.now()}`, orden: bloque.orden + 1 };
    const index = optica?.bloquesContenido?.findIndex(b => b.id === bloqueId) || 0;
    const nuevosBloques = [...(optica?.bloquesContenido || [])];
    nuevosBloques.splice(index + 1, 0, nuevoBloque);
    updateField("bloquesContenido", nuevosBloques);
  };

  const handleDragStart = (bloqueId: string) => setDraggedBlock(bloqueId);
  const handleDragOver = (e: React.DragEvent, bloqueId: string) => {
    e.preventDefault();
    if (!draggedBlock || draggedBlock === bloqueId) return;
    const bloques = optica?.bloquesContenido || [];
    const dragIndex = bloques.findIndex(b => b.id === draggedBlock);
    const dropIndex = bloques.findIndex(b => b.id === bloqueId);
    if (dragIndex === -1 || dropIndex === -1) return;
    const nuevos = [...bloques];
    const [dragged] = nuevos.splice(dragIndex, 1);
    nuevos.splice(dropIndex, 0, dragged);
    updateField("bloquesContenido", nuevos);
  };
  const handleDragEnd = () => setDraggedBlock(null);

  // ✅ Lógica para especialidades personalizadas
  const maxPersonalizadas = optica?.plan === 'premium' ? 5 : (optica?.plan === 'premium_plus' ? 999 : 0);
  const currentPersonalizadas = optica?.especialidadesPersonalizadas || [];
  const puedeAgregarPersonalizada = currentPersonalizadas.length < maxPersonalizadas;

  const agregarEspecialidadPersonalizada = () => {
    if (!nuevaEspecialidad.trim()) return;
    if (currentPersonalizadas.length >= maxPersonalizadas) {
      alert(`Has alcanzado el límite de ${maxPersonalizadas} especialidades personalizadas para tu plan.`);
      return;
    }
    if (currentPersonalizadas.includes(nuevaEspecialidad.trim())) {
      alert("Esta especialidad ya fue agregada.");
      return;
    }
    updateField("especialidadesPersonalizadas", [...currentPersonalizadas, nuevaEspecialidad.trim()]);
    setNuevaEspecialidad("");
  };

  const eliminarEspecialidadPersonalizada = (esp: string) => {
    updateField("especialidadesPersonalizadas", currentPersonalizadas.filter(e => e !== esp));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando diseñador...</p>
        </div>
      </div>
    );
  }

  if (!optica || !planConfig) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">No se pudo cargar la ficha</p></div>;
  }

  const secciones = [
    { id: "hero" as SeccionActiva, label: "Hero", icon: Palette, requierePremiumPlus: true },
    { id: "contenido" as SeccionActiva, label: "Contenido Enriquecido", icon: Sparkles, requierePremiumPlus: true },
    { id: "info" as SeccionActiva, label: "Información", icon: Mail },
    { id: "galeria" as SeccionActiva, label: "Galería", icon: ImageIcon },
    { id: "video" as SeccionActiva, label: "Video", icon: Video, requierePremiumPlus: true },
    { id: "productos" as SeccionActiva, label: "Productos", icon: Tag },
    { id: "promos" as SeccionActiva, label: "Promociones", icon: TrendingUp, requierePremiumPlus: true },
    { id: "horarios" as SeccionActiva, label: "Horarios", icon: Clock },
    { id: "especialidades" as SeccionActiva, label: "Especialidades", icon: Star },
  ];

  const seccionesDisponibles = secciones.filter(s => !s.requierePremiumPlus || optica.plan === "premium_plus");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-600 hover:text-navy-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-500" />
                  Diseña tu Ficha
                </h1>
                <p className="text-xs text-gray-500">
                  Plan actual: <span className="font-semibold text-navy-700">{planConfig.nombre}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && <span className="text-sm text-amber-600 flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>Cambios sin guardar</span>}
              <button
                onClick={guardarManual}
                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar ahora
              </button>
              <Link href={`/opticas/${optica.id}`} className="px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors">
                Ver ficha pública
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <h3 className="text-sm font-bold text-gray-700 mb-3 px-2">Secciones</h3>
              <nav className="space-y-1">
                {seccionesDisponibles.map(seccion => {
                  const Icono = seccion.icon;
                  return (
                    <button
                      key={seccion.id}
                      onClick={() => setSeccionActiva(seccion.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        seccionActiva === seccion.id
                          ? "bg-navy-900 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icono className="w-4 h-4" />
                      {seccion.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Área de edición */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">

               {/* ✅ Tarjeta de Relevancia en Tiempo Real */}
               <OptiRelevanceCard optica={optica} />

              {/* SECCIÓN: HERO */}
              {seccionActiva === "hero" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-2 flex items-center gap-2">
                      <Palette className="w-6 h-6" />
                      Personaliza tu Hero
                    </h2>
                    <p className="text-sm text-gray-600">Crea una primera impresión impactante</p>
                  </div>

                  {planConfig.puedeEditar.hero ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen de fondo</label>
                        <UploadImagen
                          value={optica.hero?.imagen || ''}
                          onChange={(data) => updateField("hero", { ...optica.hero, imagen: data })}
                          onRemove={async (publicId) => {
                            await deleteImageFromCloudinary(publicId);
                          }}
                          label="Subir imagen del hero"
                          recomendacion="Recomendado: 1920x600px"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Color del overlay</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={optica.hero?.colorOverlay || "#000000"}
                            onChange={(e) => updateField("hero", { ...optica.hero, colorOverlay: e.target.value })}
                            className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={optica.hero?.colorOverlay || "#000000"}
                            onChange={(e) => updateField("hero", { ...optica.hero, colorOverlay: e.target.value })}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Título del hero</label>
                        <input
                          type="text"
                          value={optica.hero?.titulo || ""}
                          onChange={(e) => updateField("hero", { ...optica.hero, titulo: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Ej: Tu visión, nuestra pasión"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subtítulo</label>
                        <textarea
                          value={optica.hero?.subtitulo || ""}
                          onChange={(e) => updateField("hero", { ...optica.hero, subtitulo: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                          placeholder="Describe tu óptica en una frase"
                        />
                      </div>
                    </>
                  ) : (
                    <LockedField feature="Hero personalizable" requiredPlan="Premium+" opticaId={optica.id} />
                  )}
                </div>
              )}

              {/* SECCIÓN: CONTENIDO ENRIQUECIDO */}
              {seccionActiva === "contenido" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-gold-500" />
                      Contenido Enriquecido
                    </h2>
                    <p className="text-sm text-gray-600">Crea una ficha única con bloques modulares tipo Shopify</p>
                    <div className="mt-2 px-3 py-2 bg-gold-50 border border-gold-200 rounded-lg">
                      <p className="text-xs text-gold-800 font-medium">✨ Exclusivo para plan Premium+</p>
                    </div>
                  </div>

                  {planConfig.puedeEditar.hero ? (
                    <>
                      <div className="space-y-3">
                        {(optica.bloquesContenido || []).map((bloque, index) => {
                          const tipoInfo = TIPOS_BLOQUE.find(t => t.tipo === bloque.tipo);
                          const TipoIcon = tipoInfo?.icon || Type;
                          const isEditing = bloqueEditando === bloque.id;

                          return (
                            <div
                              key={bloque.id}
                              draggable
                              onDragStart={() => handleDragStart(bloque.id)}
                              onDragOver={(e) => handleDragOver(e, bloque.id)}
                              onDragEnd={handleDragEnd}
                              className={`border-2 rounded-xl overflow-hidden transition-all ${
                                draggedBlock === bloque.id ? 'opacity-50 border-navy-500' : 'border-gray-200'
                              } ${isEditing ? 'border-navy-500 shadow-lg' : ''}`}
                            >
                              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                                  <TipoIcon className="w-5 h-5 text-navy-700" />
                                  <div>
                                    <p className="font-semibold text-sm text-navy-900">{tipoInfo?.label || bloque.tipo}</p>
                                    <p className="text-xs text-gray-500">Bloque {index + 1}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => moverBloque(bloque.id, 'up')} className="p-1.5 hover:bg-gray-200 rounded" title="Mover arriba">
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => moverBloque(bloque.id, 'down')} className="p-1.5 hover:bg-gray-200 rounded" title="Mover abajo">
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => duplicarBloque(bloque.id)} className="p-1.5 hover:bg-gray-200 rounded" title="Duplicar">
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setBloqueEditando(isEditing ? null : bloque.id)} className="p-1.5 hover:bg-gray-200 rounded" title="Editar">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => eliminarBloque(bloque.id)} className="p-1.5 hover:bg-red-100 text-red-600 rounded" title="Eliminar">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {isEditing && (
                                <div className="p-4 space-y-4">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Título</label>
                                    <input
                                      type="text"
                                      value={bloque.datos.titulo || ''}
                                      onChange={(e) => actualizarBloque(bloque.id, { titulo: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      placeholder="Título del bloque"
                                    />
                                  </div>

                                  {bloque.tipo === 'texto' && (
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contenido</label>
                                      <Editor
                                        content={bloque.datos.contenido || ''}
                                        onChange={(html) => actualizarBloque(bloque.id, { contenido: html })}
                                        placeholder="Escribe tu contenido aquí..."
                                      />
                                    </div>
                                  )}

                                  {bloque.tipo === 'imagen_texto' && (
                                    <>
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen</label>
                                        <UploadImagen
                                          value={bloque.datos.imagen || ''}
                                          onChange={(data) => actualizarBloque(bloque.id, { imagen: getImageUrl(data) })}
                                          label="Subir imagen"
                                          recomendacion="Recomendado: 800x600px"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Texto descriptivo</label>
                                        <Editor
                                          content={bloque.datos.contenido || ''}
                                          onChange={(html) => actualizarBloque(bloque.id, { contenido: html })}
                                          placeholder="Describe la imagen..."
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Layout</label>
                                        <div className="grid grid-cols-3 gap-2">
                                          {(['izquierda', 'derecha', 'centro'] as const).map(layout => (
                                            <button
                                              key={layout}
                                              onClick={() => actualizarBloque(bloque.id, { layout })}
                                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                bloque.datos.layout === layout
                                                  ? 'bg-navy-900 text-white'
                                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                              }`}
                                            >
                                              {layout.charAt(0).toUpperCase() + layout.slice(1)}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {bloque.tipo === 'video' && (
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">URL del video (YouTube o Vimeo)</label>
                                      <input
                                        type="url"
                                        value={bloque.datos.videoUrl || ''}
                                        onChange={(e) => actualizarBloque(bloque.id, { videoUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="https://youtube.com/watch?v=..."
                                      />
                                      {bloque.datos.videoUrl && getVideoEmbedUrl(bloque.datos.videoUrl) && (
                                        <div className="mt-3 aspect-video rounded-lg overflow-hidden">
                                          <iframe
                                            src={getVideoEmbedUrl(bloque.datos.videoUrl)!}
                                            className="w-full h-full"
                                            allowFullScreen
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {bloque.tipo === 'faq' && (
                                    <div className="space-y-3">
                                      <label className="block text-sm font-semibold text-gray-700">Preguntas y respuestas</label>
                                      {(bloque.datos.preguntas || []).map((pq, i) => (
                                        <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                                          <input
                                            type="text"
                                            value={pq.pregunta}
                                            onChange={(e) => {
                                              const nuevas = [...(bloque.datos.preguntas || [])];
                                              nuevas[i] = { ...nuevas[i], pregunta: e.target.value };
                                              actualizarBloque(bloque.id, { preguntas: nuevas });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                                            placeholder="Pregunta"
                                          />
                                          <textarea
                                            value={pq.respuesta}
                                            onChange={(e) => {
                                              const nuevas = [...(bloque.datos.preguntas || [])];
                                              nuevas[i] = { ...nuevas[i], respuesta: e.target.value };
                                              actualizarBloque(bloque.id, { preguntas: nuevas });
                                            }}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                            placeholder="Respuesta"
                                          />
                                          <button
                                            onClick={() => {
                                              const nuevas = (bloque.datos.preguntas || []).filter((_, idx) => idx !== i);
                                              actualizarBloque(bloque.id, { preguntas: nuevas });
                                            }}
                                            className="text-xs text-red-600 hover:underline"
                                          >
                                            Eliminar pregunta
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        onClick={() => {
                                          const nuevas = [...(bloque.datos.preguntas || []), { pregunta: '', respuesta: '' }];
                                          actualizarBloque(bloque.id, { preguntas: nuevas });
                                        }}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-navy-500 hover:text-navy-700 transition-colors flex items-center justify-center gap-2"
                                      >
                                        <Plus className="w-4 h-4" />
                                        Agregar pregunta
                                      </button>
                                    </div>
                                  )}

                                  {bloque.tipo === 'galeria' && (
                                    <div className="space-y-3">
                                      <label className="block text-sm font-semibold text-gray-700">Imágenes</label>
                                      <UploadImagen
                                        value=""
                                        onChange={(data) => {
                                          const imageUrl = getImageUrl(data);
                                          const nuevas = [...(bloque.datos.imagenes || []), imageUrl];
                                          actualizarBloque(bloque.id, { imagenes: nuevas });
                                        }}
                                        label="Agregar imagen a la galería"
                                      />
                                      <div className="grid grid-cols-3 gap-2">
                                        {(bloque.datos.imagenes || []).map((img, i) => (
                                          <div key={i} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button
                                              onClick={() => {
                                                const nuevas = (bloque.datos.imagenes || []).filter((_, idx) => idx !== i);
                                                actualizarBloque(bloque.id, { imagenes: nuevas });
                                              }}
                                              className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center"
                                            >
                                              <X className="w-4 h-4" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {bloque.tipo === 'banner' && (
                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Texto del banner</label>
                                        <Editor
                                          content={bloque.datos.contenido || ''}
                                          onChange={(html) => actualizarBloque(bloque.id, { contenido: html })}
                                          placeholder="Texto del banner..."
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-semibold text-gray-700 mb-2">Color de fondo</label>
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="color"
                                              value={bloque.datos.colorFondo || '#1e3a8a'}
                                              onChange={(e) => actualizarBloque(bloque.id, { colorFondo: e.target.value })}
                                              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                            />
                                            <input
                                              type="text"
                                              value={bloque.datos.colorFondo || '#1e3a8a'}
                                              onChange={(e) => actualizarBloque(bloque.id, { colorFondo: e.target.value })}
                                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-semibold text-gray-700 mb-2">Color de texto</label>
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="color"
                                              value={bloque.datos.colorTexto || '#ffffff'}
                                              onChange={(e) => actualizarBloque(bloque.id, { colorTexto: e.target.value })}
                                              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                            />
                                            <input
                                              type="text"
                                              value={bloque.datos.colorTexto || '#ffffff'}
                                              onChange={(e) => actualizarBloque(bloque.id, { colorTexto: e.target.value })}
                                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-semibold text-gray-700 mb-2">Texto del botón (CTA)</label>
                                          <input
                                            type="text"
                                            value={bloque.datos.ctaText || ''}
                                            onChange={(e) => actualizarBloque(bloque.id, { ctaText: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            placeholder="Ej: Ver promoción"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-semibold text-gray-700 mb-2">Link del botón</label>
                                          <input
                                            type="url"
                                            value={bloque.datos.ctaLink || ''}
                                            onChange={(e) => actualizarBloque(bloque.id, { ctaLink: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            placeholder="https://..."
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Vista previa</label>
                                        <div
                                          className="rounded-lg p-6 text-center"
                                          style={{ backgroundColor: bloque.datos.colorFondo || '#1e3a8a', color: bloque.datos.colorTexto || '#ffffff' }}
                                        >
                                          {bloque.datos.titulo && <h3 className="text-xl font-bold mb-2">{bloque.datos.titulo}</h3>}
                                          {bloque.datos.contenido && <div dangerouslySetInnerHTML={{ __html: bloque.datos.contenido }} />}
                                          {bloque.datos.ctaText && (
                                            <button className="mt-3 px-4 py-2 bg-white rounded-lg font-semibold" style={{ color: bloque.datos.colorFondo }}>
                                              {bloque.datos.ctaText}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {!isEditing && (
                                <div className="p-4 bg-gray-50">
                                  {bloque.datos.titulo && <p className="font-semibold text-sm text-navy-900 mb-1">{bloque.datos.titulo}</p>}
                                  {bloque.tipo === 'texto' && bloque.datos.contenido && (
                                    <div className="text-xs text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: bloque.datos.contenido }} />
                                  )}
                                  {bloque.tipo === 'imagen_texto' && (
                                    <p className="text-xs text-gray-600">Imagen + Texto ({bloque.datos.layout})</p>
                                  )}
                                  {bloque.tipo === 'video' && bloque.datos.videoUrl && (
                                    <p className="text-xs text-gray-600">🎥 {bloque.datos.videoUrl}</p>
                                  )}
                                  {bloque.tipo === 'faq' && (
                                    <p className="text-xs text-gray-600">{bloque.datos.preguntas?.length || 0} preguntas</p>
                                  )}
                                  {bloque.tipo === 'galeria' && (
                                    <p className="text-xs text-gray-600">{bloque.datos.imagenes?.length || 0} imágenes</p>
                                  )}
                                  {bloque.tipo === 'banner' && (
                                    <div
                                      className="px-3 py-2 rounded text-xs font-medium"
                                      style={{ backgroundColor: bloque.datos.colorFondo, color: bloque.datos.colorTexto }}
                                    >
                                      {bloque.datos.ctaText || 'Banner'}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-4 text-center">Agregar nuevo bloque</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {TIPOS_BLOQUE.map(tipo => {
                            const Icono = tipo.icon;
                            return (
                              <button
                                key={tipo.tipo}
                                onClick={() => agregarBloque(tipo.tipo)}
                                className="p-4 border-2 border-gray-200 rounded-xl hover:border-navy-500 hover:bg-navy-50 transition-all text-left group"
                              >
                                <Icono className="w-6 h-6 text-gray-600 group-hover:text-navy-700 mb-2" />
                                <p className="font-semibold text-sm text-gray-900">{tipo.label}</p>
                                <p className="text-xs text-gray-500 mt-1">{tipo.descripcion}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <LockedField feature="Contenido enriquecido con bloques modulares" requiredPlan="Premium+" opticaId={optica.id} />
                  )}
                </div>
              )}

              {/* SECCIÓN: INFORMACIÓN */}
              {seccionActiva === "info" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-2 flex items-center gap-2">
                      <Mail className="w-6 h-6" />
                      Información de contacto
                    </h2>
                    <p className="text-sm text-gray-600">Cómo pueden encontrarte tus clientes</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Logo de la óptica</label>
                    {(planConfig.puedeEditar.logo || optica.plan === 'premium' || optica.plan === 'premium_plus') ? (
                      <UploadImagen
                        value={optica.logo || ''}
                        onChange={(data) => updateField("logo", getImageUrl(data))}
                        label="Subir logo"
                        recomendacion="PNG o JPG, recomendado 500x500px"
                      />
                    ) : (
                      <LockedField feature="Logo personalizado" requiredPlan="Premium" opticaId={optica.id} />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre comercial</label>
                    <input type="text" value={optica.nombreComercial || ""} onChange={(e) => updateField("nombreComercial", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">Descripción</label>
                      {planConfig.limites.maxCaracteresDescripcion > 0 && <CharCounter current={optica.descripcion?.length || 0} max={planConfig.limites.maxCaracteresDescripcion} />}
                    </div>
                    {planConfig.puedeEditar.descripcion ? (
                      <textarea value={optica.descripcion || ""} onChange={(e) => { if (e.target.value.length <= planConfig.limites.maxCaracteresDescripcion) updateField("descripcion", e.target.value); }} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none" placeholder="Describe qué hace especial a tu óptica..." />
                    ) : (
                      <LockedField feature="Descripción personalizada" requiredPlan="Premium" opticaId={optica.id} />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                      <input type="tel" value={optica.telefono || ""} onChange={(e) => updateField("telefono", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp</label>
                      <input type="tel" value={optica.whatsapp || ""} onChange={(e) => updateField("whatsapp", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" value={optica.email || ""} onChange={(e) => updateField("email", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sitio web</label>
                    <input type="url" value={optica.sitioWeb || ""} onChange={(e) => updateField("sitioWeb", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="https://tuoptica.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Google Maps</label>
                    <input type="url" value={optica.urlGoogleMaps || ""} onChange={(e) => updateField("urlGoogleMaps", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="https://maps.google.com/..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Facebook</label>
                      <input type="url" value={optica.facebook || ""} onChange={(e) => updateField("facebook", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="https://facebook.com/..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram</label>
                      <input type="url" value={optica.instagram || ""} onChange={(e) => updateField("instagram", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="https://instagram.com/..." />
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN: GALERÍA */}
              {seccionActiva === "galeria" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-2 flex items-center gap-2">
                      <ImageIcon className="w-6 h-6" />
                      Galería de fotos
                    </h2>
                    <p className="text-sm text-gray-600">Muestra tu óptica con las mejores fotos</p>
                  </div>

                  {planConfig.puedeEditar.fotos ? (
                    <>
                      <UploadImagen
                        value=""
                        onChange={(data) => {
                          const imageUrl = getImageUrl(data);
                          const publicId = typeof data === 'string' ? '' : (data?.publicId || '');
                          const nuevas = [...(optica.fotos || []), { url: imageUrl, publicId, caption: '' }];
                          updateField("fotos", nuevas);
                        }}
                        label="Agregar foto a la galería"
                        recomendacion={`Máximo ${planConfig.limites.maxFotos} fotos • JPG, PNG • Máx 5MB`}
                      />

                      <div className="space-y-3">
                        {optica.fotos?.map((foto, i) => {
                          const fotoUrl = getFotoUrl(foto);
                          const fotoCaption = getFotoCaption(foto);

                          return (
                            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {fotoUrl ? (
                                  <img src={fotoUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                    Sin imagen
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={fotoCaption}
                                  onChange={(e) => {
                                    const nuevas = [...(optica.fotos || [])];
                                    if (typeof nuevas[i] === 'string') {
                                      nuevas[i] = { url: nuevas[i], caption: e.target.value, publicId: '' };
                                    } else {
                                      nuevas[i] = { ...nuevas[i], caption: e.target.value };
                                    }
                                    updateField("fotos", nuevas);
                                  }}
                                  placeholder="Agregar descripción..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <button
                                onClick={() => eliminarFotoGaleria(i)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Eliminar foto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-sm text-gray-600 text-center">
                        {optica.fotos?.length || 0} / {planConfig.limites.maxFotos} fotos
                      </p>
                    </>
                  ) : (
                    <LockedField feature="Galería de fotos" requiredPlan="Premium" opticaId={optica.id} />
                  )}
                </div>
              )}

              {/* SECCIÓN: VIDEO */}
              {seccionActiva === "video" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-2 flex items-center gap-2">
                      <Video className="w-6 h-6" />
                      Videos promocionales
                    </h2>
                    <p className="text-sm text-gray-600">
                      Agrega hasta 3 videos para mostrar tu óptica. YouTube, Vimeo o subida directa.
                    </p>
                  </div>

                  {planConfig.puedeEditar.videos ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                          <span className="text-sm">🔗</span>
                          Video de YouTube o Vimeo
                        </h3>
                        <input
                          type="url"
                          value={optica.videos?.[0] || ""}
                          onChange={(e) => updateField("videos", [e.target.value])}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Pega la URL completa del video de YouTube o Vimeo
                        </p>
                        {optica.videos?.[0] && getVideoEmbedUrl(optica.videos[0]) && (
                          <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                              src={getVideoEmbedUrl(optica.videos[0])!}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-gold-50 rounded-lg border border-gold-200">
                        <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                          <span className="text-sm">☁️</span>
                          Subir video directamente
                          <span className="text-xs bg-gold-500 text-white px-2 py-0.5 rounded-full ml-2">Premium+</span>
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          Sube tu video directamente a nuestra plataforma. Máximo 100MB.
                        </p>
                        <UploadVideo
                          value={optica.videoCloudinary}
                          onChange={(data) => {
                            updateField("videoCloudinary", {
                              url: data.url,
                              publicId: data.publicId
                            });
                          }}
                          onRemove={async (publicId) => {
                            await deleteImageFromCloudinary(publicId);
                          }}
                          label="Subir video promocional"
                        />
                      </div>

                      {(optica.videos?.[0] || optica.videoCloudinary) && (
                        <div className="p-4 bg-navy-50 rounded-lg border border-navy-200">
                          <h3 className="font-semibold text-navy-900 mb-3">Vista previa de videos</h3>
                          <div className="space-y-3">
                            {optica.videos?.[0] && getVideoEmbedUrl(optica.videos[0]) && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">YouTube/Vimeo:</p>
                                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                                  <iframe
                                    src={getVideoEmbedUrl(optica.videos[0])!}
                                    className="w-full h-full"
                                    allowFullScreen
                                  />
                                </div>
                              </div>
                            )}
                            {optica.videoCloudinary && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Video subido:</p>
                                <video
                                  src={optica.videoCloudinary.url}
                                  controls
                                  className="w-full rounded-lg bg-black"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <LockedField feature="Videos promocionales" requiredPlan="Premium+" opticaId={optica.id} />
                  )}
                </div>
              )}

              {/* SECCIÓN: PRODUCTOS */}
              {seccionActiva === "productos" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-2 flex items-center gap-2">
                      <Tag className="w-6 h-6" />
                      Productos destacados
                    </h2>
                    <p className="text-sm text-gray-600">Muestra hasta 3 productos estrella</p>
                  </div>

                  <div className="space-y-4">
                    {(optica.productosDestacados || []).map((producto, i) => (
                      <div key={producto.id} className="p-4 border border-gray-200 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-navy-900">Producto {i + 1}</h4>
                          <button onClick={() => updateField("productosDestacados", optica.productosDestacados?.filter((_, idx) => idx !== i))} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <UploadImagen
                          value={producto.imagen || ''}
                          onChange={(data) => {
                            const imageUrl = getImageUrl(data);
                            const nuevos = [...(optica.productosDestacados || [])];
                            nuevos[i] = { ...nuevos[i], imagen: imageUrl };
                            updateField("productosDestacados", nuevos);
                          }}
                          label="Imagen del producto"
                        />
                        <input type="text" value={producto.nombre} onChange={(e) => { const nuevos = [...(optica.productosDestacados || [])]; nuevos[i] = { ...nuevos[i], nombre: e.target.value }; updateField("productosDestacados", nuevos); }} placeholder="Nombre del producto" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        <textarea value={producto.descripcion} onChange={(e) => { const nuevos = [...(optica.productosDestacados || [])]; nuevos[i] = { ...nuevos[i], descripcion: e.target.value }; updateField("productosDestacados", nuevos); }} placeholder="Descripción" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" value={producto.precio || ""} onChange={(e) => { const nuevos = [...(optica.productosDestacados || [])]; nuevos[i] = { ...nuevos[i], precio: e.target.value }; updateField("productosDestacados", nuevos); }} placeholder="Precio (opcional)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                          <input type="url" value={producto.link || ""} onChange={(e) => { const nuevos = [...(optica.productosDestacados || [])]; nuevos[i] = { ...nuevos[i], link: e.target.value }; updateField("productosDestacados", nuevos); }} placeholder="Link (opcional)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                      </div>
                    ))}

                    {(optica.productosDestacados?.length || 0) < 3 && (
                      <button onClick={() => updateField("productosDestacados", [...(optica.productosDestacados || []), { id: Date.now().toString(), nombre: "", descripcion: "", imagen: "" }])} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-navy-500 hover:text-navy-700 transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        Agregar producto
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* SECCIÓN: PROMOCIONES */}
              {seccionActiva === "promos" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6" />
                      Promociones y ofertas
                    </h2>
                    <p className="text-sm text-gray-600">Atrae clientes con ofertas especiales</p>
                  </div>

                  {planConfig.puedeEditar.promociones ? (
                    <div className="space-y-4">
                      {(optica.promociones || []).map((promo, i) => (
                        <div key={promo.id} className="p-4 border border-gray-200 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-navy-900">Promoción {i + 1}</h4>
                            <button onClick={() => updateField("promociones", optica.promociones?.filter((_, idx) => idx !== i))} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <input type="text" value={promo.titulo} onChange={(e) => { const nuevas = [...(optica.promociones || [])]; nuevas[i] = { ...nuevas[i], titulo: e.target.value }; updateField("promociones", nuevas); }} placeholder="Título de la promoción" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                          <textarea value={promo.descripcion} onChange={(e) => { const nuevas = [...(optica.promociones || [])]; nuevas[i] = { ...nuevas[i], descripcion: e.target.value }; updateField("promociones", nuevas); }} placeholder="Descripción de la oferta" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Fecha inicio (opcional)</label>
                              <input type="date" value={promo.fechaInicio || ""} onChange={(e) => { const nuevas = [...(optica.promociones || [])]; nuevas[i] = { ...nuevas[i], fechaInicio: e.target.value }; updateField("promociones", nuevas); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Fecha fin (opcional)</label>
                              <input type="date" value={promo.fechaFin || ""} onChange={(e) => { const nuevas = [...(optica.promociones || [])]; nuevas[i] = { ...nuevas[i], fechaFin: e.target.value }; updateField("promociones", nuevas); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                          </div>
                          <p className="text-xs text-amber-600">⚠️ Si no colocas fecha de finalización, se seguirá mostrando hasta que edites o elimines</p>
                        </div>
                      ))}

                      <button onClick={() => updateField("promociones", [...(optica.promociones || []), { id: Date.now().toString(), titulo: "", descripcion: "", activa: true }])} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-navy-500 hover:text-navy-700 transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        Agregar promoción
                      </button>
                    </div>
                  ) : (
                    <LockedField feature="Promociones y ofertas" requiredPlan="Premium+" opticaId={optica.id} />
                  )}
                </div>
              )}

              {/* SECCIÓN: HORARIOS */}
              {seccionActiva === "horarios" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-2 flex items-center gap-2">
                      <Clock className="w-6 h-6" />
                      Horarios de atención
                    </h2>
                    <p className="text-sm text-gray-600">Define cuándo estás abierto</p>
                  </div>

                  <div className="space-y-2">
                    {optica.horarios?.map((horario, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="w-24 font-medium text-gray-700">{horario.dia}</span>
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <input type="checkbox" checked={horario.cerrado} onChange={(e) => { const nuevos = [...(optica.horarios || [])]; nuevos[i] = { ...nuevos[i], cerrado: e.target.checked }; updateField("horarios", nuevos); }} className="rounded border-gray-300" />
                          Cerrado
                        </label>
                        {!horario.cerrado && (
                          <>
                            <input type="time" value={horario.apertura} onChange={(e) => { const nuevos = [...(optica.horarios || [])]; nuevos[i] = { ...nuevos[i], apertura: e.target.value }; updateField("horarios", nuevos); }} className="px-2 py-1 border border-gray-300 rounded text-sm" />
                            <span className="text-gray-500">a</span>
                            <input type="time" value={horario.cierre} onChange={(e) => { const nuevos = [...(optica.horarios || [])]; nuevos[i] = { ...nuevos[i], cierre: e.target.value }; updateField("horarios", nuevos); }} className="px-2 py-1 border border-gray-300 rounded text-sm" />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ SECCIÓN: ESPECIALIDADES (ACTUALIZADA) */}
              {seccionActiva === "especialidades" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-2 flex items-center gap-2">
                      <Star className="w-6 h-6" />
                      Especialidades y seguros
                    </h2>
                    <p className="text-sm text-gray-600">Define los servicios que ofreces para aparecer en búsquedas específicas.</p>
                  </div>

                  {/* 1. ESPECIALIDADES GENÉRICAS */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Especialidades Generales
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">Disponibles para todos los planes. Aparecen en el directorio principal.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ESPECIALIDADES_GENERICAS.map(esp => {
                        const seleccionada = optica.especialidades?.includes(esp);
                        return (
                          <button 
                            key={esp} 
                            onClick={() => { 
                              const nuevas = seleccionada 
                                ? (optica.especialidades?.filter(e => e !== esp) || []) 
                                : [...(optica.especialidades || []), esp]; 
                              updateField("especialidades", nuevas); 
                            }} 
                            className={`p-3 rounded-lg border text-left text-sm transition-all ${seleccionada ? "bg-navy-50 border-navy-500 text-navy-900 font-medium" : "bg-white border-gray-200 hover:border-navy-300"}`}
                          >
                            {esp}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. ESPECIALIDADES PERSONALIZADAS */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                        Especialidades Personalizadas
                      </h3>
                      {optica.plan !== 'free' && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          currentPersonalizadas.length >= maxPersonalizadas ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}>
                          {currentPersonalizadas.length} de {maxPersonalizadas === 999 ? '∞' : maxPersonalizadas} utilizadas
                        </span>
                      )}
                    </div>
                    
                    {optica.plan === 'free' ? (
                      <LockedField feature="Especialidades personalizadas" requiredPlan="Premium" opticaId={optica.id} />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={nuevaEspecialidad}
                            onChange={(e) => setNuevaEspecialidad(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && agregarEspecialidadPersonalizada()}
                            placeholder="Ej: Ortoqueratología, Lentes para deporte..."
                            disabled={!puedeAgregarPersonalizada}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                          <button
                            onClick={agregarEspecialidadPersonalizada}
                            disabled={!puedeAgregarPersonalizada || !nuevaEspecialidad.trim()}
                            className="px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        </div>

                        {currentPersonalizadas.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {currentPersonalizadas.map((esp, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-gold-50 border border-gold-200 text-gold-900 px-3 py-1.5 rounded-full text-sm">
                                <span>{esp}</span>
                                <button
                                  onClick={() => eliminarEspecialidadPersonalizada(esp)}
                                  className="text-gold-700 hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                                  title="Eliminar especialidad"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No has agregado especialidades personalizadas aún.</p>
                        )}
                        
                        {optica.plan === 'premium' && currentPersonalizadas.length >= 5 && (
                          <p className="text-xs text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Has alcanzado el límite de 5 especialidades para el plan Premium. Mejora a Premium+ para ilimitadas.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. SEGUROS ACEPTADOS */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Seguros aceptados
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {SEGUROS_DISPONIBLES.map(seguro => {
                        const seleccionada = optica.segurosAceptados?.includes(seguro);
                        return (
                          <button 
                            key={seguro} 
                            onClick={() => { 
                              const nuevos = seleccionada 
                                ? (optica.segurosAceptados?.filter(s => s !== seguro) || []) 
                                : [...(optica.segurosAceptados || []), seguro]; 
                              updateField("segurosAceptados", nuevos); 
                            }} 
                            className={`p-3 rounded-lg border text-left text-sm transition-all ${seleccionada ? "bg-blue-50 border-blue-500 text-blue-900 font-medium" : "bg-white border-gray-200 hover:border-blue-300"}`}
                          >
                            {seguro}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vista previa */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Vista previa
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[600px] overflow-y-auto">
                {seccionActiva === "hero" && optica.hero && (
                  <div>
                    <div
                      className="aspect-video rounded-lg mb-3 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: optica.hero.colorOverlay || "#000" }}
                    >
                      {optica.hero.imagen ? (
                        <img
                          src={getHeroImagenUrl(optica.hero.imagen)}
                          alt="Hero"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-sm">Vista previa del hero</span>
                      )}
                    </div>
                    {optica.hero.titulo && <p className="font-bold text-navy-900 mb-1">{optica.hero.titulo}</p>}
                    {optica.hero.subtitulo && <p className="text-sm text-gray-600">{optica.hero.subtitulo}</p>}
                  </div>
                )}
                {seccionActiva === "contenido" && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{optica.bloquesContenido?.length || 0} bloques</p>
                    {(optica.bloquesContenido || []).map((bloque, i) => {
                      const tipoInfo = TIPOS_BLOQUE.find(t => t.tipo === bloque.tipo);
                      return (
                        <div key={bloque.id} className="mb-2 p-2 bg-white border border-gray-200 rounded">
                          <p className="text-xs font-semibold text-navy-900">{i + 1}. {tipoInfo?.label}</p>
                          {bloque.datos.titulo && <p className="text-xs text-gray-700">{bloque.datos.titulo}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {seccionActiva === "info" && (
                  <div className="space-y-2">
                    {optica.logo && <img src={optica.logo} alt="Logo" className="w-20 h-20 object-cover rounded-lg" />}
                    <p className="font-bold text-navy-900">{optica.nombreComercial || "Nombre de tu óptica"}</p>
                    {optica.descripcion && <p className="text-sm text-gray-600">{optica.descripcion}</p>}
                    {optica.telefono && <p className="text-xs text-gray-600">📞 {optica.telefono}</p>}
                    {optica.whatsapp && <p className="text-xs text-gray-600">💬 {optica.whatsapp}</p>}
                    {optica.sitioWeb && <p className="text-xs text-gray-600">🌐 {optica.sitioWeb}</p>}
                  </div>
                )}
                {seccionActiva === "galeria" && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{optica.fotos?.length || 0} fotos</p>
                    <div className="grid grid-cols-2 gap-2">
                      {optica.fotos?.slice(0, 4).map((foto, i) => {
                        const fotoUrl = getFotoUrl(foto);
                        return (
                          <div key={i} className="aspect-square bg-gray-200 rounded overflow-hidden">
                            {fotoUrl ? (
                              <img
                                src={fotoUrl}
                                alt={`Foto ${i + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                Sin imagen
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {seccionActiva === "productos" && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{optica.productosDestacados?.length || 0} productos</p>
                    {optica.productosDestacados?.map((p, i) => (
                      <div key={p.id} className="mb-2 p-2 bg-gray-100 rounded">
                        <p className="font-semibold text-sm">{p.nombre}</p>
                        <p className="text-xs text-gray-600">{p.descripcion}</p>
                      </div>
                    ))}
                  </div>
                )}
                {seccionActiva === "promos" && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{optica.promociones?.length || 0} promociones</p>
                    {optica.promociones?.map((promo, i) => (
                      <div key={promo.id} className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded">
                        <p className="font-semibold text-sm text-amber-900">{promo.titulo}</p>
                        <p className="text-xs text-amber-700">{promo.descripcion}</p>
                      </div>
                    ))}
                  </div>
                )}
                {seccionActiva === "horarios" && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Horarios</p>
                    {optica.horarios?.slice(0, 3).map((h, i) => (
                      <p key={i} className="text-xs text-gray-600">{h.dia}: {h.cerrado ? "Cerrado" : `${h.apertura} - ${h.cierre}`}</p>
                    ))}
                  </div>
                )}
                {seccionActiva === "especialidades" && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{optica.especialidades?.length || 0} especialidades</p>
                    <div className="flex flex-wrap gap-1">
                      {optica.especialidades?.slice(0, 5).map((e, i) => (
                        <span key={i} className="text-xs bg-navy-100 text-navy-700 px-2 py-1 rounded">{e}</span>
                      ))}
                      {optica.especialidadesPersonalizadas?.slice(0, 3).map((e, i) => (
                        <span key={`p-${i}`} className="text-xs bg-gold-100 text-gold-800 px-2 py-1 rounded border border-gold-200">{e} ✨</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AutoSaveIndicator status={saveStatus} />
    </div>
  );
}