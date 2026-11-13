"use client";

import { useState } from "react";
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  FileText,
  Video,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Play,
} from "lucide-react";
import { useConfig } from "@/hooks/useConfig";
import Link from "next/link";

export default function AyudaPage() {
  const [categoriaAbierta, setCategoriaAbierta] = useState<string | null>("General");
  const [busqueda, setBusqueda] = useState("");

  // Cargar datos dinámicos desde Firestore
  const { data: faqData, loading: loadingFaq } = useConfig("faq");
  const { data: recursosData, loading: loadingRecursos } = useConfig("recursos");
  const { data: soporteData, loading: loadingSoporte } = useConfig("soporte");

  // Soporte es un objeto, no un array
  const soporte = soporteData?.[0] || {
    email: "soporte@laopticacercademi.com",
    whatsapp: "5512345678",
    telefono: "55 1234 5678",
    horarioAtencion: "Lunes a Viernes de 9:00 a 18:00 hrs",
  };

// Filtrar FAQ por búsqueda (con validación robusta)
const faqFiltrado = faqData
const faqFiltrado = Array.isArray(faqData)
  ? faqData
      .filter((cat) => cat && cat.preguntas && Array.isArray(cat.preguntas))
      .map((cat) => ({
        ...cat,
        preguntas: cat.preguntas
          .filter((p) => p && p.pregunta && p.respuesta)
          .filter((p) => p.pregunta.trim() !== "" && p.respuesta.trim() !== ""),
      }))
      .filter((cat) => cat.preguntas.length > 0)
  : [];

  const toggleCategoria = (categoria: string) => {
    setCategoriaAbierta(categoriaAbierta === categoria ? null : categoria);
  };

  const getIconoRecurso = (icono: string) => {
    switch (icono) {
      case "FileText":
        return FileText;
      case "Video":
        return Video;
      case "Lightbulb":
        return Lightbulb;
      default:
        return FileText;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container-premium">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-navy-900 font-display mb-3">
              Centro de ayuda
            </h1>
            <p className="text-gray-600">
              Encuentra respuestas, tutoriales y contacto de soporte.
            </p>
          </div>

          {/* Buscador */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar en preguntas frecuentes..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal: FAQ */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card-premium p-6">
                <h2 className="text-xl font-bold text-navy-900 mb-4 font-display flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Preguntas frecuentes
                </h2>

                {loadingFaq ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-navy-200 border-t-navy-700 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500">Cargando preguntas...</p>
                  </div>
                ) : faqFiltrado.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      {busqueda
                        ? "No se encontraron preguntas con ese término."
                        : "No hay preguntas disponibles."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {faqFiltrado.map((cat) => (
                      <div
                        key={cat.categoria}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleCategoria(cat.categoria)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        >
                          <span className="font-semibold text-navy-900">
                            {cat.categoria}
                          </span>
                          {categoriaAbierta === cat.categoria ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>

                        {categoriaAbierta === cat.categoria && (
                          <div className="divide-y divide-gray-100">
                            {cat.preguntas.map((p, i) => (
                              <div key={i} className="p-4">
                                <h3 className="font-semibold text-navy-900 text-sm mb-2">
                                  {p.pregunta}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {p.respuesta}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recursos / Tutoriales */}
              <div className="card-premium p-6">
                <h2 className="text-xl font-bold text-navy-900 mb-4 font-display flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recursos y tutoriales
                </h2>

                {loadingRecursos ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-navy-200 border-t-navy-700 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500">Cargando recursos...</p>
                  </div>
                ) : !Array.isArray(recursosData) || recursosData.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No hay recursos disponibles.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recursosData.map((recurso, i) => {
                      const Icono = getIconoRecurso(recurso.icono);
                      return (
                        <a
                          key={i}
                          href={recurso.url}
                          target={recurso.url.startsWith("http") ? "_blank" : undefined}
                          rel={recurso.url.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="p-4 border border-gray-200 rounded-lg hover:border-navy-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-navy-200 transition-colors">
                              {recurso.tipo === "video" ? (
                                <Play className="w-5 h-5 text-navy-700" />
                              ) : (
                                <Icono className="w-5 h-5 text-navy-700" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-navy-900 text-sm mb-1 line-clamp-2">
                                {recurso.titulo}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {recurso.descripcion}
                              </p>
                              <div className="flex items-center gap-1 mt-2 text-xs text-navy-700 font-medium">
                                {recurso.tipo === "video" ? "Ver video" : "Leer más"}
                                <ExternalLink className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Columna lateral: Soporte */}
            <div className="lg:col-span-1">
              <div className="card-premium p-6 sticky top-24">
                <h2 className="text-lg font-bold text-navy-900 mb-4 font-display">
                  ¿Necesitas ayuda?
                </h2>

                {loadingSoporte ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-4 border-navy-200 border-t-navy-700 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">Cargando...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Email */}
                    <a
                      href={`mailto:${soporte.email}`}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-navy-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-0.5">
                          Email
                        </p>
                        <p className="text-xs text-navy-900 break-all">
                          {soporte.email}
                        </p>
                      </div>
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/${soporte.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-0.5">
                          WhatsApp
                        </p>
                        <p className="text-xs text-green-900">
                          {soporte.telefono}
                        </p>
                      </div>
                    </a>

                    {/* Horario */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-navy-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-0.5">
                          Horario de atención
                        </p>
                        <p className="text-xs text-gray-600">
                          {soporte.horarioAtencion}
                        </p>
                      </div>
                    </div>

                    {/* Teléfono */}
                    <a
                      href={`tel:${soporte.telefono.replace(/\s/g, "")}`}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-navy-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-0.5">
                          Teléfono
                        </p>
                        <p className="text-xs text-navy-900">
                          {soporte.telefono}
                        </p>
                      </div>
                    </a>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Tiempo promedio de respuesta: 2 horas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}