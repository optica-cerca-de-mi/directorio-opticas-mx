"use client";

import { useState } from "react";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useConfig } from "@/hooks/useConfig";

export default function AdminFAQ() {
  const [categoriaAbierta, setCategoriaAbierta] = useState<string | null>(null);
  const { data: faqData, loading } = useConfig("faq");
  const faq = faqData?.items || [];

  if (loading) return <div className="p-8 text-center text-gray-600">Cargando FAQ...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 font-display mb-2 flex items-center gap-3">
          <MessageCircle className="w-8 h-8" />
          Gestión de FAQ
        </h1>
        <p className="text-gray-600">Preguntas frecuentes por categoría. (Edición avanzada próximamente)</p>
      </div>

      <div className="space-y-3">
        {faq.map((cat: any, index: number) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setCategoriaAbierta(categoriaAbierta === cat.categoria ? null : cat.categoria)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-navy-900">{cat.categoria}</span>
                <span className="text-xs bg-navy-100 text-navy-700 px-2 py-0.5 rounded-full">
                  {cat.preguntas.length} preguntas
                </span>
              </div>
              {categoriaAbierta === cat.categoria ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {categoriaAbierta === cat.categoria && (
              <div className="divide-y divide-gray-100">
                {cat.preguntas.map((p: any, i: number) => (
                  <div key={i} className="p-4">
                    <p className="font-semibold text-navy-900 text-sm mb-1">{p.pregunta}</p>
                    <p className="text-sm text-gray-600">{p.respuesta}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}