// 🎯 OptiAdBoost - Configuración de slots publicitarios
// Cada slot tiene un ID único, ubicación y estado (activo/inactivo)

export interface AdSlotConfig {
  id: string;
  ubicacion: string;
  descripcion: string;
  activo: boolean;
  tipo: 'banner' | 'rectangle' | 'skyscraper';
  // Cuando tengas Google Ads, aquí pegarás el data-ad-slot
  googleAdSlot?: string;
  googleAdClient?: string;
}

export const AD_SLOTS: Record<string, AdSlotConfig> = {
  // 🏠 HOME
  'home-between-1': {
    id: 'home-between-1',
    ubicacion: 'Home - Entre Top 3 y Beneficios',
    descripcion: 'Banner horizontal después del Top 3',
    activo: true,
    tipo: 'banner',
  },

  // 📋 LISTADO DE ÓPTICAS
  'opticas-list-top': {
    id: 'opticas-list-top',
    ubicacion: '/opticas - Después del hero',
    descripcion: 'Banner horizontal al inicio del listado',
    activo: true,
    tipo: 'banner',
  },

  // 🗺️ LISTADO DE ESTADOS
  'estados-list-top': {
    id: 'estados-list-top',
    ubicacion: '/estados - Después del hero',
    descripcion: 'Banner horizontal al inicio de estados',
    activo: true,
    tipo: 'banner',
  },

  // 📍 ESTADO INDIVIDUAL
  'estado-detalle-mid': {
    id: 'estado-detalle-mid',
    ubicacion: '/estados/[estado] - Entre listado de ópticas',
    descripcion: 'Banner en página de estado específico',
    activo: true,
    tipo: 'banner',
  },

  // 🏪 FICHA DE ÓPTICA FREE (2 espacios)
  'ficha-free-after-hero': {
    id: 'ficha-free-after-hero',
    ubicacion: 'Ficha Free - Después del hero',
    descripcion: 'Primer espacio publicitario en ficha free',
    activo: true,
    tipo: 'rectangle',
  },
  'ficha-free-before-footer': {
    id: 'ficha-free-before-footer',
    ubicacion: 'Ficha Free - Antes del footer',
    descripcion: 'Segundo espacio publicitario en ficha free',
    activo: true,
    tipo: 'rectangle',
  },

  // 💼 PLANES (B2B)
  'planes-mid': {
    id: 'planes-mid',
    ubicacion: '/planes - Entre planes',
    descripcion: 'Banner en página de planes (audiencia B2B)',
    activo: true,
    tipo: 'banner',
  },

  // 🌐 FOOTER GLOBAL
  'footer-global': {
    id: 'footer-global',
    ubicacion: 'Footer - Todas las páginas públicas',
    descripcion: 'Banner discreto en el footer global',
    activo: true,
    tipo: 'banner',
  },
};

// Helper para obtener un slot por ID
export const getAdSlot = (id: string): AdSlotConfig | undefined => {
  return AD_SLOTS[id];
};

// Helper para obtener slots activos por ubicación
export const getActiveSlots = (): AdSlotConfig[] => {
  return Object.values(AD_SLOTS).filter(slot => slot.activo);
};