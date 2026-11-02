export type PlanType = "free" | "premium" | "premium_plus";

export interface Horario {
  dia: string;
  apertura: string;
  cierre: string;
  cerrado?: boolean; // ✅ Agregado: necesario para el motor de ranking
}

export interface Cupon {
  texto: string;
  vigenciaInicio?: string;
  vigenciaFin?: string;
}

export interface RedesSociales {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
}

export interface ResenaNativa { // ✅ Agregado: para el score de recomendaciones
  id: string;
  nombre: string;
  calificacion: number;
  texto: string;
  fecha: string | Date;
}

export interface Optica {
  id: string;
  uid?: string; // ✅ Agregado: ID de Firebase Auth
  slug: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  whatsapp?: string;
  horarios: Horario[];

  // Premium y Premium+
  logo?: string;
  descripcion?: string;
  galeria?: string[];
  fotos?: string[]; // ✅ Agregado: alias para compatibilidad con el motor de ranking
  especialidades?: string[];
  segurosAceptados?: string[];
  linkResenasGoogle?: string;
  linkAgendarCita?: string;
  calificacionGoogle?: number;
  numeroResenas?: number;
  reseñasNativas?: ResenaNativa[]; // ✅ Agregado: para el score de recomendaciones

  // Solo Premium+
  cupon?: Cupon;
  redesSociales?: RedesSociales;
  videoUrl?: string;

  // Metadata y Ranking
  plan: PlanType;
  verificado: boolean;
  latitud?: number; // ✅ Agregado: para cálculo de distancia
  longitud?: number; // ✅ Agregado: para cálculo de distancia
  fechaCreacion?: any; // ✅ Agregado: para cálculo de antigüedad
  estado?: string; // ✅ Agregado: para filtrar ópticas "activas"
  email?: string; // ✅ Agregado
}