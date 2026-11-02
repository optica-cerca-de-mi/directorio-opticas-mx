import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { rankOpticas, RankingContext, OpticaConScore } from "./ranking-engine";

export interface OpticaRankingResult {
  opticas: OpticaConScore[];
  top3: OpticaConScore[];
  metricas: any;
}

export async function obtenerOpticasConRanking(
  contexto: RankingContext = {}
): Promise<OpticaRankingResult> {
  // 1. Cargar todas las ópticas de Firebase
  const snapshot = await getDocs(collection(db, "opticas"));
  
  const opticas = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // 2. Calcular ranking con el algoritmo
  const { opticas: opticasConScore, metricas } = rankOpticas(opticas, contexto, 3);

  // 3. Separar top 3
  const top3 = opticasConScore.filter(o => o.esRecomendada);

  return {
    opticas: opticasConScore,
    top3,
    metricas
  };
}