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
}

export default function JsonLdOptica({
  nombre,
  descripcion,
  telefono,
  whatsapp,
  email,
  sitioWeb,
  direccion,
  ciudad,
  estado,
  cp,
  horarios,
  calificacionGoogle,
  numResenas,
  fotos,
  logo,
  facebook,
  instagram,
  especialidades,
  urlGoogleMaps,
}: JsonLdOpticaProps) {
  // Construir la dirección completa
  const direccionCompleta = [direccion, ciudad, estado, cp].filter(Boolean).join(', ');

  // Construir horarios en formato Schema.org
  const openingHours = horarios
    ?.filter((h) => !h.cerrado)
    .map((h) => {
      const diasMap: Record<string, string> = {
        Lunes: 'Mo',
        Martes: 'Tu',
        Miércoles: 'We',
        Jueves: 'Th',
        Viernes: 'Fr',
        Sábado: 'Sa',
        Domingo: 'Su',
      };
      const diaCorto = diasMap[h.dia] || h.dia.slice(0, 2);
      return `${diaCorto} ${h.apertura}-${h.cierre}`;
    });

  // Construir datos de reseñas
  const aggregateRating = calificacionGoogle
    ? {
        '@type': 'AggregateRating' as const,
        ratingValue: calificacionGoogle,
        reviewCount: numResenas || 0,
        bestRating: 5,
        worstRating: 1,
      }
    : undefined;

  // Construir imagen principal
  const imagenPrincipal = logo || fotos?.[0]?.url || undefined;

  // Schema.org JSON-LD para LocalBusiness (Óptica)
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Optician' as const, // Tipo específico para ópticas
    name: nombre,
    description: descripcion || `Óptica ${nombre} en ${ciudad}, ${estado}`,
    url: sitioWeb || undefined,
    telephone: telefono || undefined,
    email: email || undefined,
    address: direccionCompleta
      ? {
          '@type': 'PostalAddress' as const,
          streetAddress: direccion || undefined,
          addressLocality: ciudad || undefined,
          addressRegion: estado || undefined,
          postalCode: cp || undefined,
          addressCountry: 'MX',
        }
      : undefined,
    openingHours: openingHours || undefined,
    aggregateRating: aggregateRating,
    image: imagenPrincipal || undefined,
    logo: logo || undefined,
    sameAs: [
      facebook || undefined,
      instagram || undefined,
      urlGoogleMaps || undefined,
    ].filter(Boolean),
    priceRange: '$$', // Rango de precios (puedes ajustarlo)
    areaServed: ciudad
      ? {
          '@type': 'City' as const,
          name: ciudad,
        }
      : undefined,
    hasOfferCatalog: especialidades?.length
      ? {
          '@type': 'OfferCatalog' as const,
          name: 'Servicios de Óptica',
          itemListElement: especialidades.map((esp, i) => ({
            '@type': 'Offer' as const,
            itemOffered: {
              '@type': 'Service' as const,
              name: esp,
            },
            position: i + 1,
          })),
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}