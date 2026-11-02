"use client";

import { useRef, useState } from "react";
import { Upload, X, Video, Loader2 } from "lucide-react";

interface UploadVideoProps {
  value?: { url: string; publicId: string };
  onChange: (data: { url: string; publicId: string }) => void;
  label?: string;
  onRemove?: (publicId: string) => void;
}

export default function UploadVideo({ 
  value, 
  onChange, 
  label = "Subir video",
  onRemove 
}: UploadVideoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      alert('Solo se permiten videos MP4, WebM o MOV');
      return;
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El video excede 100MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resource_type', 'video');

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

const handleRemove = () => {
  if (value?.publicId && onRemove) {
    // Ahora usamos el publicId guardado directamente
    onRemove(value.publicId);
  }
  onChange({ url: '', publicId: '' });
};

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
        className="hidden"
      />
      
      {value?.url ? (
        <div className="relative">
          <video 
            src={value} 
            controls 
            className="w-full max-h-64 rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 shadow-lg"
            title="Eliminar video"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 text-sm text-navy-700 hover:underline font-medium"
          >
            Cambiar video
          </button>
        </div>
      ) : (
        <div 
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            uploading 
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-navy-500 cursor-pointer'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-navy-700 animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">Subiendo video...</p>
              <p className="text-xs text-gray-500">Esto puede tardar unos segundos</p>
            </div>
          ) : (
            <>
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
              <p className="text-xs text-gray-500">MP4, WebM o MOV (máx 100MB)</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}