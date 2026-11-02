"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useConfig(collectionName: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Buscando documento:', collectionName);
      const docRef = doc(db, "config", collectionName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('✅ Documento encontrado:', docSnap.data());
        setData(docSnap.data());
      } else {
        console.log('⚠️ Documento NO existe');
        setData(null);
      }
    } catch (err) {
      console.error('❌ Error al cargar:', collectionName, err);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [collectionName]);

  return { data, loading, error, refetch: fetchData };
}