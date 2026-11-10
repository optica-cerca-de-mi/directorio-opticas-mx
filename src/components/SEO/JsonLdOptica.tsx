interface JsonLdOpticaProps {
  nombre: string;
  descripcion?: string;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  sitioWeb?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  cp?: string;
  latitud?: number;          // ✅ NUEVO: Coordenadas GPS
  longitud?: number;         // ✅ NUEVO: Coordenadas GPS
  horarios?: Array<{
    dia: string;
    apertura: string;
    cierre: string;
    cerrado: boolean;
  }>;
  calificacionGoogle?: number;
  numResenas?: number;
  fotos?: Array<{ url: string; caption?: string }>;
  logo?: string;
  facebook?: string;
  instagram?: string;
  especialidades?: string[];
  urlGoogleMaps?: string;
  precioRango?: string;      // ✅ NUEVO: Personalizable (ej: "$$", "$$$")
  aceptaPago?: string[];     // ✅ NUEVO: Métodos de pago
  urlPagina?: string;        // ✅ NUEVO: URL canónica de la página
}

// ✅ Función helper: Limpia valores undefined/null recursivamente para evitar schemas inválidos
function cleanObject(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      const filtered = value.filter(v => v !== undefined && v !== null && v !== '');
      if (filtered.length > 0) cleaned[key] = filtered;
    } else if (typeof value === 'object' && value !== null) {
      const nested = cleanObject(value as Record<string, unknown>);
      if (Object.keys(nested).length > 0) cleaned[key] = nested;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// ✅ Función helper: Sanitiza strings para prevenir errores de sintaxis en JSON
function sanitize(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export default function JsonLdOptica(props: JsonLdOpticaProps) {
  const {
    nombre, descripcion, telefono, whatsapp, email, sitioWeb,
    direccion, ciudad, estado, cp, latitud, longitud,
    horarios, calificacionGoogle, numResenas, fotos, logo,
    facebook, instagram, especialidades, urlGoogleMaps,
    precioRango = '$$', aceptaPago, urlPagina,
  } = props;

  // Mapeo de días de español a estándar Schema.org
  const diasMap: Record<string, string> = {
    'Lunes': 'Monday', 'Martes': 'Tuesday', 'Miércoles': 'Wednesday',
    'Jueves': 'Thursday', 'Viernes': 'Friday', 'Sábado': 'Saturday',
    'Domingo': 'Sunday',
  };

  const mainSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Optician',
    '@id': urlPagina || `#optica-${nombre.toLowerCase().replace(/\s+/g, '-')}`,
    name: sanitize(nombre),
    description: sanitize(descripcion || `Óptica ${nombre} en ${ciudad || ''}, ${estado || ''}. Servicios de optometría, lentes y armazones.`),
    url: sitioWeb || urlPagina || undefined,
    telephone: telefono || whatsapp || undefined,
    email: email || undefined,
    priceRange: precioRango,

    // ✅ Dirección completa
    address: {
      '@type': 'PostalAddress',
      streetAddress: direccion || undefined,
      addressLocality: ciudad || undefined,
      addressRegion: estado || undefined,
      postalCode: cp || undefined,
      addressCountry: 'MX',
    },

    // ✅ NUEVO: Coordenadas geográficas (CRUCIAL para SEO local y mapas)
    geo: (latitud && longitud) ? {
      '@type': 'GeoCoordinates',
      latitude: latitud,
      longitude: longitud,
    } : undefined,

    // ✅ NUEVO: openingHoursSpecification (Estándar actual de Google, más granular)
    openingHoursSpecification: horarios
      ?.filter(h => !h.cerrado)
      .map(h => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: diasMap[h.dia] || h.dia,
        opens: h.apertura,
        closes: h.cierre,
      })) || undefined,

    // ✅ Reseñas agregadas
    aggregateRating: calificacionGoogle ? {
      '@type': 'AggregateRating',
      ratingValue: calificacionGoogle,
      reviewCount: numResenas || 0,
      bestRating: 5,
      worstRating: 1,
    } : undefined,

    // ✅ Imágenes
    image: fotos?.map(f => f.url).filter(Boolean) || (logo ? [logo] : undefined),
    logo: logo || undefined,

    // ✅ Redes sociales y links externos
    sameAs: [facebook, instagram, urlGoogleMaps].filter(Boolean),

    // ✅ NUEVO: Métodos de pago aceptados
    paymentAccepted: aceptaPago || ['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia'],
    currenciesAccepted: 'MXN',

    // ✅ Área de servicio
    areaServed: ciudad ? {
      '@type': 'City',
      name: ciudad,
    } : estado ? {
      '@type': 'State',
      name: estado,
    } : undefined,

    // ✅ Catálogo de servicios/ofertas
    hasOfferCatalog: especialidades?.length ? {
      '@type': 'OfferCatalog',
      name: 'Servicios de Óptica',
      itemListElement: especialidades.map((esp, i) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: sanitize(esp),
          provider: { '@type': 'Optician', name: sanitize(nombre) },
          areaServed: ciudad ? { '@type': 'City', name: ciudad } : undefined,
        },
        position: i + 1,
      })),
    } : undefined,

    // ✅ NUEVO: Contacto adicional (WhatsApp)
    contactPoint: whatsapp ? {
      '@type': 'ContactPoint',
      telephone: whatsapp,
      contactType: 'customer service',
      availableLanguage: ['Spanish'],
    } : undefined,
  };

  // ✅ LIMPIAR Y RENDERIZAR
  const cleanedSchema = cleanObject(mainSchema);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanedSchema)
      }}
    />
  );
}