// src/types/optica.ts

export type PlanType = "free" | "premium" | "premium_plus";

export interface Horario {
  dia: string; // "Lunes", "Martes", etc.
  apertura: string; // "09:00"
  cierre: string; // "18:00"
}

export interface Optica {
  id: string;
  slug: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  estado: string;
  telefono: string;
  whatsapp?: string; // Número para botón de WhatsApp
  horarios: Horario[];
  
  // Datos de planes Premium
  logo?: string;
  descripcion?: string;
  galeria?: string[];
  
  // Nuevos campos para conversión y filtros
  especialidades?: string[]; // Ej: ["Graduaciones altas", "Lentes de contacto"]
  segurosAceptados?: string[]; // Ej: ["AUNA", "GNP", "MetLife"]
  linkResenasGoogle?: string; // URL directa a las reseñas de Google Maps
  linkAgendarCita?: string; // URL de Calendly o Google Calendar
  
  // Metadata
  plan: PlanType;
  verificado: boolean;
  calificacionGoogle?: number; // 1.0 a 5.0
  numeroResenas?: number;
}