import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { CONCEPTS_MAP } from "./concepts-map";

interface BusquedaFallida {
  query: string;
  timestamp: any;
  filtros_detectados: {
    ciudad?: string | null;
    especialidad?: string | null;
    seguro?: string | null;
  };
  terminos_expandidos: string[];
  resultados_count: number;
}

/**
 * Analiza búsquedas fallidas y sugiere nuevos términos para el diccionario.
 * Retorna un array de sugerencias con:
 * - término sugerido
 * - frecuencia (cuántas veces apareció)
 * - concepto existente más cercano (si aplica)
 */
export async function obtenerSugerenciasDiccionario(): Promise<
  Array<{
    termino: string;
    frecuencia: number;
    conceptoCercano?: string;
    categoriaSugerida?: string;
  }>
> {
  try {
    // Obtener búsquedas fallidas de los últimos 30 días
    const treintaDiasAtras = new Date();
    treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

    const q = query(
      collection(db, "franklin_analytics"),
      where("resultados_count", "==", 0),
      where("timestamp", ">=", treintaDiasAtras),
      orderBy("timestamp", "desc"),
      limit(500)
    );

    const snapshot = await getDocs(q);
    const busquedas: BusquedaFallida[] = snapshot.docs.map((doc) => doc.data() as BusquedaFallida);

    // Agrupar por query y contar frecuencia
    const frecuenciaMap = new Map<string, number>();
    busquedas.forEach((b) => {
      const queryLimpio = b.query.toLowerCase().trim();
      frecuenciaMap.set(queryLimpio, (frecuenciaMap.get(queryLimpio) || 0) + 1);
    });

    // Filtrar solo las que aparecen 3+ veces (umbral de relevancia)
    const sugerencias: Array<{
      termino: string;
      frecuencia: number;
      conceptoCercano?: string;
      categoriaSugerida?: string;
    }> = [];

    frecuenciaMap.forEach((frecuencia, termino) => {
      if (frecuencia >= 3) {
        // Buscar concepto cercano existente
        const conceptoCercano = encontrarConceptoCercano(termino);
        
        sugerencias.push({
          termino,
          frecuencia,
          conceptoCercano: conceptoCercano?.nombre,
          categoriaSugerida: conceptoCercano?.categoria,
        });
      }
    });

    // Ordenar por frecuencia descendente
    return sugerencias.sort((a, b) => b.frecuencia - a.frecuencia);
  } catch (error) {
    console.error("Error al obtener sugerencias:", error);
    return [];
  }
}

/**
 * Encuentra el concepto existente más cercano al término sugerido.
 * Útil para saber si debemos agregar el término a un concepto existente o crear uno nuevo.
 */
function encontrarConceptoCercano(termino: string): { nombre: string; categoria: string } | null {
  const terminoLower = termino.toLowerCase();

  for (const [key, concepto] of Object.entries(CONCEPTS_MAP)) {
    // Verificar si algún sinónimo contiene palabras clave del término
    const match = concepto.sinonimos.some((sinonimo) => {
      const palabrasSinonimo = sinonimo.toLowerCase().split(" ");
      const palabrasTermino = terminoLower.split(" ");
      
      // Si comparten 2+ palabras significativas (3+ caracteres), es cercano
      const palabrasComunes = palabrasSinonimo.filter((p) =>
        palabrasTermino.some((pt) => pt.length >= 3 && p.includes(pt))
      );
      return palabrasComunes.length >= 2;
    });

    if (match) {
      return { nombre: key, categoria: concepto.categoria };
    }
  }

  return null;
}