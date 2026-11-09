import { MetadataRoute } from 'next';
// Importamos nuestra instancia segura de Firebase Admin
import { db } from '@/lib/firebase-admin'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // URL base de tu sitio (ajústala si ya tienes tu dominio propio)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://directorio-opticas-mx.vercel.app';

  // 1. 🏠 PÁGINAS ESTÁTICAS (Alta prioridad)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // La Home es lo más importante
    },
    {
      url: `${baseUrl}/opticas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9, // El directorio cambia seguido
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
  ];

  // 2. 🏪 PÁGINAS DINÁMICAS (Fichas de Ópticas)
  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    // Buscamos solo las ópticas que están activas en Firebase
    const snapshot = await db.collection('opticas').where('estado', '==', 'activa').get();
    
    dynamicPages = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Usamos la fecha de última actualización si existe, si no, la fecha actual
      const lastMod = data.updatedAt ? new Date(data.updatedAt) : new Date();
      
      return {
        url: `${baseUrl}/opticas/${doc.id}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const, // Google debe revisarlas cada semana
        priority: 0.8, // Alta prioridad porque son el core del negocio
      };
    });

    console.log(`✅ OptiBoost: Sitemap generado con ${dynamicPages.length} ópticas.`);
  } catch (error) {
    console.error('❌ OptiBoost: Error al generar el sitemap dinámico:', error);
  }

  // 3. 🚀 Unimos todo y se lo entregamos a Next.js
  return [...staticPages, ...dynamicPages];
}