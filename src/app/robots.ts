import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://directorio-opticas-mx.vercel.app';

  return {
    rules: [
      // ═══════════════════════════════════════════════════════
      // 🟢 GOOGLEBOT - Máxima prioridad y cobertura
      // ═══════════════════════════════════════════════════════
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/opticas/',
          '/estados/',
          '/planes',
          '/ayuda',
          '/contacto-publicidad',
          '/_next/static/',        // ✅ Recursos de Next.js
          '/images/',              // ✅ Imágenes del directorio
          '/api/og/',              // ✅ Open Graph images
          '/sitemap.xml',          // ✅ El sitemap mismo
        ],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',                 // ✅ Bloquear toda la API
          '/registro/',            // ✅ No indexar páginas de registro
          '/login',
          '/checkout/',
          '/api/auth/',            // ✅ Endpoints de auth
          '/api/webhooks/',        // ✅ Webhooks internos
        ],
      },

      // ═══════════════════════════════════════════════════════
      // 🔵 BINGBOT - Buena cobertura
      // ═══════════════════════════════════════════════════════
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/opticas/',
          '/estados/',
          '/planes',
          '/_next/static/',
          '/images/',
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

      // ═══════════════════════════════════════════════════════
      // 🟡 BOTS DE REDES SOCIALES - Para previews/OG tags
      // ═══════════════════════════════════════════════════════
      {
        userAgent: 'facebookexternalhit',
        allow: ['/'],
        disallow: ['/dashboard/', '/admin/', '/api/'],
      },
      {
        userAgent: 'Twitterbot',
        allow: ['/'],
        disallow: ['/dashboard/', '/admin/', '/api/'],
      },
      {
        userAgent: 'LinkedInBot',
        allow: ['/'],
        disallow: ['/dashboard/', '/admin/', '/api/'],
      },

      // ═══════════════════════════════════════════════════════
      // 🔴 BOTS DE AI - PROTEGER CONTENIDO PROPIO
      // ═══════════════════════════════════════════════════════
      {
        userAgent: 'GPTBot',
        disallow: ['/'],           // ❌ Bloquear ChatGPT training
      },
      {
        userAgent: 'ClaudeBot',
        disallow: ['/'],           // ❌ Bloquear Claude training
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],           // ❌ Bloquear CommonCrawl
      },
      {
        userAgent: 'Bytespider',
        disallow: ['/'],           // ❌ Bloquear TikTok/ByteDance
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],           // ❌ Bloquear Gemini training
      },

      // ═══════════════════════════════════════════════════════
      // 🟠 BOTS SEO - Permitir con límites de velocidad
      // ═══════════════════════════════════════════════════════
      {
        userAgent: 'AhrefsBot',
        allow: ['/'],
        disallow: ['/dashboard/', '/admin/', '/api/', '/checkout/'],
        crawlDelay: 10,            // ⏱️ Limitar velocidad
      },
      {
        userAgent: 'SemrushBot',
        allow: ['/'],
        disallow: ['/dashboard/', '/admin/', '/api/', '/checkout/'],
        crawlDelay: 10,
      },

      // ═══════════════════════════════════════════════════════
      // ⚪ BOTS GENÉRICOS - Reglas por defecto
      // ═══════════════════════════════════════════════════════
      {
        userAgent: '*',
        allow: [
          '/',
          '/opticas/',
          '/estados/',
          '/_next/static/',
          '/images/',
        ],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/registro/',
          '/login',
          '/checkout/',
          '/_next/image/',          // ✅ Bloquear image optimizer
        ],
        crawlDelay: 5,             // ⏱️ Default crawl delay
      },
    ],

    // 🔗 Sitemaps
    sitemap: [
      `${baseUrl}/sitemap.xml`,
    ],

    // 🌐 Host canónico
    host: baseUrl,
  };
}