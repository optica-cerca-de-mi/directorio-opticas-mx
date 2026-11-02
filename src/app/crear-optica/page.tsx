"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Store, MapPin, Phone, Mail, Crown, Star, Check } from "lucide-react";

const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

const PLANES = [
  {
    id: "free",
    nombre: "Visibilidad Básica",
    precio: "0",
    periodo: "para siempre",
    icono: Store,
    color: "gray",
    beneficios: [
      "Presencia en el directorio",
      "Ficha básica con ubicación",
      "1 foto de la óptica",
      "Horarios de atención",
    ],
  },
  {
    id: "premium",
    nombre: "Presencia Digital",
    precio: "199",
    periodo: "mensual",
    icono: Star,
    color: "navy",
    destacado: true,
    beneficios: [
      "Todo lo del plan Básico",
      "Galería de hasta 8 fotos",
      "Enlaces a redes sociales",
      "Descripción personalizada",
      "Productos destacados",
      "Optimización SEO",
    ],
  },
  {
    id: "premium_plus",
    nombre: "Premium+",
    precio: "599",
    periodo: "mensual",
    icono: Crown,
    color: "gold",
    beneficios: [
      "Todo lo del plan Digital",
      "Hero personalizable",
      "Contenido enriquecido",
      "Video promocional",
      "Promociones activas",
      "Posicionamiento #1",
      "Sin publicidad en tu ficha",
    ],
  },
];

export default function CrearOpticaPage() {
  const router = useRouter();
  const auth = useAuth() as any;
  const usuario = auth.usuario;
  const cargando = auth.cargando || auth.loading;

  const [step, setStep] = useState(0); // 0 = elegir plan, 1 = info óptica, 2 = contacto
  const [planSeleccionado, setPlanSeleccionado] = useState("free");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombreComercial: "",
    direccion: "",
    ciudad: "",
    estado: "",
    cp: "",
    telefono: "",
    whatsapp: "",
    email: "",
    horarios: [
      { dia: "Lunes", apertura: "09:00", cierre: "19:00", cerrado: false },
      { dia: "Martes", apertura: "09:00", cierre: "19:00", cerrado: false },
      { dia: "Miércoles", apertura: "09:00", cierre: "19:00", cerrado: false },
      { dia: "Jueves", apertura: "09:00", cierre: "19:00", cerrado: false },
      { dia: "Viernes", apertura: "09:00", cierre: "19:00", cerrado: false },
      { dia: "Sábado", apertura: "10:00", cierre: "15:00", cerrado: false },
      { dia: "Domingo", apertura: "00:00", cierre: "00:00", cerrado: true },
    ],
  });

  useEffect(() => {
    if (!cargando && !usuario) {
      router.push("/login?redirect=/crear-optica");
    }
  }, [usuario, cargando, router]);

  if (cargando || !usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-navy-700 animate-spin" />
      </div>
    );
  }

  const handleCrearOptica = async () => {
    setSaving(true);
    try {
      const opticaId = `optica_${Date.now()}`;
      const opticaData = {
        ...formData,
        uid: usuario.uid,
        plan: planSeleccionado,
        estado: "activa",
        fechaCreacion: new Date().toISOString(),
        verificada: false,
        especialidades: [],
        segurosAceptados: [],
        fotos: [],
        descripcion: "",
      };

      await setDoc(doc(db, "opticas", opticaId), opticaData);

      const usuarioRef = doc(db, "usuarios", usuario.uid);
      const usuarioSnap = await getDoc(usuarioRef);
      
      if (usuarioSnap.exists()) {
        const data = usuarioSnap.data();
        const opticas = data.opticas || [];
        await setDoc(usuarioRef, { ...data, opticas: [...opticas, opticaId] }, { merge: true });
      } else {
        await setDoc(usuarioRef, {
          uid: usuario.uid,
          email: usuario.email,
          opticas: [opticaId],
        });
      }

      router.push(`/dashboard/${opticaId}/disenar-ficha`);
    } catch (error) {
      console.error("Error al crear óptica:", error);
      alert("Error al crear la óptica. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-900 rounded-2xl mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-navy-900 font-display mb-2">
            ¡Bienvenido {usuario.displayName || usuario.email}!
          </h1>
          <p className="text-gray-600">
            {step === 0 
              ? "Elige el plan que mejor se adapte a tu negocio"
              : "Vamos a crear tu primera óptica. Completa la información básica."}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= s ? "bg-navy-900 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {s === 0 ? "P" : s}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* PASO 0: Elegir plan */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy-900 text-center mb-6">
                Elige tu plan
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANES.map((plan) => {
                  const Icono = plan.icono;
                  const seleccionado = planSeleccionado === plan.id;
                  
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setPlanSeleccionado(plan.id)}
                      className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                        seleccionado
                          ? plan.color === "gold"
                            ? "border-gold-500 bg-gold-50 shadow-lg"
                            : plan.color === "navy"
                            ? "border-navy-900 bg-navy-50 shadow-lg"
                            : "border-gray-400 bg-gray-50 shadow-lg"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {plan.destacado && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-navy-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Más popular
                          </span>
                        </div>
                      )}

                      <div className="text-center">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                          plan.color === "gold" ? "bg-gold-100" :
                          plan.color === "navy" ? "bg-navy-100" : "bg-gray-100"
                        }`}>
                          <Icono className={`w-6 h-6 ${
                            plan.color === "gold" ? "text-gold-700" :
                            plan.color === "navy" ? "text-navy-700" : "text-gray-600"
                          }`} />
                        </div>

                        <h3 className="font-bold text-navy-900 mb-1">{plan.nombre}</h3>
                        
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-navy-900">
                            ${plan.precio}
                          </span>
                          <span className="text-sm text-gray-500">/{plan.periodo}</span>
                        </div>

                        <ul className="space-y-2 text-left">
                          {plan.beneficios.map((beneficio, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{beneficio}</span>
                            </li>
                          ))}
                        </ul>

                        {seleccionado && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600">
                              <Check className="w-4 h-4" />
                              Plan seleccionado
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors"
              >
                Continuar con este plan
              </button>
            </div>
          )}

          {/* PASO 1: Información de la óptica */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5" />
                Información de la óptica
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre comercial *
                </label>
                <input
                  type="text"
                  value={formData.nombreComercial}
                  onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                  placeholder="Óptica Álvarez"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dirección *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="Av. Principal 123, Col. Centro"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    placeholder="CDMX"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Estado *</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500 bg-white"
                    required
                  >
                    <option value="">Selecciona...</option>
                    {ESTADOS_MEXICO.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CP</label>
                  <input
                    type="text"
                    value={formData.cp}
                    onChange={(e) => setFormData({ ...formData, cp: e.target.value })}
                    placeholder="06000"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Atrás
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.nombreComercial || !formData.direccion || !formData.ciudad || !formData.estado}
                  className="flex-1 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: Contacto */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contacto y horarios
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="55 1234 5678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="55 1234 5678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email de contacto</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contacto@optica.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-navy-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Atrás
                </button>
                <button
                  onClick={handleCrearOptica}
                  disabled={saving}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Store className="w-5 h-5" />
                      Crear óptica
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}