import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase-admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://directorio-opticas-mx.vercel.app';

  // 1. 🏠 PÁGINAS ESTÁTICAS (Alta prioridad)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/opticas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/registro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/planes`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ayuda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contacto-publicidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 2. 🏪 PÁGINAS DINÁMICAS (Fichas de Ópticas)
  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    // ✅ Validación: verificar que db esté disponible
    if (!db) {
      console.warn('⚠️ OptiBoost: Firebase Admin no está disponible. Sitemap sin fichas dinámicas.');
    } else {
      // ✅ Consulta permisiva: trae todas las ópticas (sin filtro de estado)
      const snapshot = await db.collection('opticas').get();
      
      dynamicPages = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          
          // Saltar ópticas sin nombre (datos corruptos)
          if (!data.nombre) return null;
          
          const lastMod = data.updatedAt 
            ? new Date(data.updatedAt) 
            : data.fechaCreacion 
              ? data.fechaCreacion.toDate() 
              : new Date();
          
          // Prioridad basada en el plan (Premium+ > Premium > Free)
          let priority = 0.6;
          if (data.plan === 'premium_plus') priority = 0.9;
          else if (data.plan === 'premium') priority = 0.8;
          
          return {
            url: `${baseUrl}/opticas/${doc.id}`,
            lastModified: lastMod,
            changeFrequency: 'weekly' as const,
            priority,
          };
        })
        .filter((page): page is MetadataRoute.Sitemap[0] => page !== null);

      console.log(`✅ OptiBoost: Sitemap generado con ${dynamicPages.length} ópticas.`);
    }
  } catch (error) {
    console.error('❌ OptiBoost: Error al generar el sitemap dinámico:', error);
  }

  // 3. 🚀 Unimos todo
  return [...staticPages, ...dynamicPages];
}