"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface BannerData {
  id: string;
  nombre: string;
  ubicacion: string;
  imagenUrl: string;
  linkDestino: string;
  activo: boolean;
  fechaInicio: string;
  fechaFin: string;
}

interface BannerDinamicoProps {
  ubicacion: string;
  className?: string;
}

export default function BannerDinamico({ ubicacion, className = "" }: BannerDinamicoProps) {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarBanner = async () => {
      try {
        const hoy = new Date().toISOString().split('T')[0];
        
        const q = query(
          collection(db, "banners_publicidad"),
          where("ubicacion", "==", ubicacion),
          where("activo", "==", true)
        );

        const snapshot = await getDocs(q);
        
        const bannersValidos: BannerData[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as BannerData;
          const inicio = data.fechaInicio || "";
          const fin = data.fechaFin || "";
          
          // Si no hay fecha fin, el banner está activo indefinidamente
          const dentroDeRango = 
            (!inicio || hoy >= inicio) && 
            (!fin || hoy <= fin);
          
          if (dentroDeRango) {
            bannersValidos.push({ id: doc.id, ...data });
          }
        });

        if (bannersValidos.length > 0) {
          setBanner(bannersValidos[0]);
        }
      } catch (error) {
        console.error("Error al cargar banner:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarBanner();
  }, [ubicacion]);

  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        <div className="bg-gray-100 rounded-xl h-[90px] animate-pulse"></div>
      </div>
    );
  }

  if (!banner) {
    return null;
  }

  const contenido = (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="text-center py-2 bg-gray-100 border-b border-gray-200">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
            Publicidad
          </p>
        </div>
        <div className="flex items-center justify-center p-4">
          <img
            src={banner.imagenUrl}
            alt={banner.nombre}
            className="max-w-full h-auto rounded"
            style={{ maxHeight: "250px" }}
          />
        </div>
      </div>
    </div>
  );

  if (banner.linkDestino) {
    return (
      <Link href={banner.linkDestino} target="_blank" rel="noopener noreferrer">
        {contenido}
      </Link>
    );
  }

  return contenido;
}