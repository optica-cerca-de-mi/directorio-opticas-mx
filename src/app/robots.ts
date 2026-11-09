import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://directorio-opticas-mx.vercel.app';

  return {
    rules: [
      // 🤖 Reglas para Googlebot (el más importante)
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/opticas/',
          '/estados/',
          '/planes',
          '/ayuda',
          '/contacto-publicidad',
        ],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/registro/',
          '/login',
          '/checkout/',
        ],
      },
      // 🤖 Reglas para Bingbot
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/opticas/',
          '/estados/',
        ],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/registro/',
          '/login',
        ],
      },
      // 🤖 Reglas para todos los demás bots
      {
        userAgent: '*',
        allow: [
          '/',
          '/opticas/',
          '/estados/',
        ],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/registro/',
          '/login',
          '/checkout/',
        ],
      },
    ],
    // 🔗 Referencia al sitemap (¡CRUCIAL!)
    sitemap: `${baseUrl}/sitemap.xml`,
    // 🌐 Host canónico
    host: baseUrl,
  };
}