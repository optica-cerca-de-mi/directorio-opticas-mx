import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface FranklinAnalyticsData {
  query: string;
  timestamp: any;
  filtros_detectados: {
    ciudad?: string | null;
    especialidad?: string | null;
    seguro?: string | null;
  };
  terminos_expandidos: string[];
  terminos_clinicos: string[];
  resultados_count: number;
  opticas_devueltas: string[];
  user_agent?: string;
  ubicacion?: {
    lat?: number;
    lng?: number;
  };
}

/**
 * Registra una búsqueda de Franklin en Firestore para analytics.
 * Se llama automáticamente cuando hay 0 resultados o cuando el usuario interactúa.
 */
export async function registrarBusquedaFranklin(data: FranklinAnalyticsData): Promise<void> {
  try {
    await addDoc(collection(db, "franklin_analytics"), {
      ...data,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al registrar analytics de Franklin:", error);
    // No lanzamos error para no romper la experiencia del usuario
  }
}