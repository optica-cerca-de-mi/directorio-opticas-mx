import { Optica } from "@/types/optica";

export const mockOpticas: Optica[] = [
  // ===== FREE =====
  {
    id: "1",
    slug: "optica-la-vista-cdmx",
    nombre: "Óptica La Vista",
    direccion: "Av. Insurgentes Sur 1234, Col. Del Valle",
    ciudad: "Ciudad de México",
    estado: "Ciudad de México", // ← CAMBIADO DE "CDMX" A "Ciudad de México"
    telefono: "55 1234 5678",
    horarios: [
      { dia: "Lunes-Viernes", apertura: "10:00", cierre: "19:00" },
      { dia: "Sábado", apertura: "10:00", cierre: "14:00" },
    ],
    plan: "free",
    verificado: false,
  },

  // ===== PREMIUM =====
  {
    id: "2",
    slug: "optica-san-angel",
    nombre: "Óptica San Ángel",
    direccion: "Av. Revolución 456, San Ángel",
    ciudad: "Ciudad de México",
    estado: "Ciudad de México", // ← CAMBIADO DE "CDMX" A "Ciudad de México"
    telefono: "55 2345 6789",
    whatsapp: "5215523456789",
    horarios: [
      { dia: "Lunes-Viernes", apertura: "09:00", cierre: "20:00" },
      { dia: "Sábado", apertura: "10:00", cierre: "15:00" },
    ],
    descripcion:
      "Más de 20 años brindando salud visual a la comunidad de San Ángel. Especialistas en lentes graduados y de contacto.",
    especialidades: ["Lentes graduados", "Lentes de contacto", "Armazones de marca"],
    segurosAceptados: ["AUNA", "GNP"],
    linkResenasGoogle: "https://google.com/maps/optica-san-angel",
    calificacionGoogle: 4.7,
    numeroResenas: 89,
    plan: "premium",
    verificado: true,
  },

  // ===== PREMIUM+ =====
  {
    id: "3",
    slug: "optica-vision-clara-izcalli",
    nombre: "Óptica Visión Clara",
    direccion: "Av. 1 de Mayo 789, Centro, Cuautitlán Izcalli",
    ciudad: "Cuautitlán Izcalli",
    estado: "Estado de México",
    telefono: "55 3456 7890",
    whatsapp: "5215534567890",
    horarios: [
      { dia: "Lunes-Viernes", apertura: "09:00", cierre: "20:00" },
      { dia: "Sábado", apertura: "10:00", cierre: "16:00" },
      { dia: "Domingo", apertura: "11:00", cierre: "14:00" },
    ],
    descripcion:
      "Óptica líder en Cuautitlán Izcalli con entrega de lentes en 1 hora. Examen de la vista sin costo con la compra de armazón.",
    especialidades: [
      "Entrega en 1 hora",
      "Examen de la vista gratis",
      "Graduaciones altas",
      "Lentes de contacto",
      "Filtro de luz azul",
    ],
    segurosAceptados: ["AUNA", "GNP", "MetLife", "AXA"],
    linkResenasGoogle: "https://google.com/maps/optica-vision-clara",
    linkAgendarCita: "https://calendly.com/optica-vision-clara",
    calificacionGoogle: 4.9,
    numeroResenas: 247,
    plan: "premium_plus",
    verificado: true,
    cupon: {
      texto: "20% de descuento en armazones de marca",
      vigenciaInicio: "2026-10-01",
      vigenciaFin: "2026-12-31",
    },
    redesSociales: {
      facebook: "https://facebook.com/opticavisionclara",
      instagram: "https://instagram.com/opticavisionclara",
    },
  },
];

export function getOpticaBySlug(slug: string): Optica | undefined {
  return mockOpticas.find((optica) => optica.slug === slug);
}

export function getAllOpticas(): Optica[] {
  return mockOpticas;
}