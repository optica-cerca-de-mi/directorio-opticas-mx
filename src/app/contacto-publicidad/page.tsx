"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Building2, Mail, User, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ContactoPublicidad() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    empresa: "",
    telefono: "",
    tipo: "banner",
    mensaje: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEnviando(true);

    try {
      await addDoc(collection(db, "solicitudes_publicidad"), {
        ...formData,
        estado: "nuevo",
        fechaCreacion: serverTimestamp(),
      });

      setEnviado(true);
      setFormData({
        nombre: "",
        email: "",
        empresa: "",
        telefono: "",
        tipo: "banner",
        mensaje: "",
      });
    } catch (err) {
      console.error("Error al enviar:", err);
      setError("Error al enviar el mensaje. Por favor intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const tiposPublicidad = [
    { valor: "banner", label: "Banner en el directorio", descripcion: "Visible en la página principal y directorio" },
    { valor: "destacado", label: "Óptica destacada", descripcion: "Aparece en el Top 3 de recomendadas" },
    { valor: "patrocinio", label: "Patrocinio general", descripcion: "Logo en el footer y menciones especiales" },
  ];

  if (enviado) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mb-2 font-display">
            ¡Mensaje enviado!
          </h1>
          <p className="text-gray-600 mb-6">
            Gracias por tu interés. Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-navy-900 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-navy-900 font-display">
                Publicidad en La Óptica Cerca de mí
              </h1>
              <p className="text-gray-600 text-sm">
                Llega a miles de ópticas en todo México
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info lateral */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h3 className="font-bold text-navy-900 mb-4">Opciones disponibles</h3>
              <div className="space-y-3">
                {tiposPublicidad.map((tipo) => (
                  <div key={tipo.valor} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-navy-900">{tipo.label}</p>
                    <p className="text-xs text-gray-600 mt-1">{tipo.descripcion}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-navy-900 mb-2">¿Por qué anunciarse aquí?</h4>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                    Audiencia 100% segmentada al sector óptico
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                    Tráfico cualificado de dueños de ópticas
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                    Formatos no invasivos y elegantes
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-navy-900 mb-2 font-display">
                Solicita información
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Completa el formulario y te contactaremos con una propuesta personalizada.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Nombre completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email corporativo *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                        placeholder="tu@empresa.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                      placeholder="55 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tipo de publicidad *
                  </label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 bg-white"
                  >
                    {tiposPublicidad.map((tipo) => (
                      <option key={tipo.valor} value={tipo.valor}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Cuéntanos sobre tu proyecto *
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      required
                      rows={4}
                      value={formData.mensaje}
                      onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 resize-none"
                      placeholder="¿Qué te gustaría promocionar? ¿Tienes alguna fecha en mente?"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className={`w-full px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    enviando ? "opacity-60 cursor-not-allowed" : "shadow-lg hover:shadow-xl"
                  }`}
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar solicitud
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Al enviar aceptas nuestra política de privacidad. Te contactaremos en 24 horas hábiles.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}