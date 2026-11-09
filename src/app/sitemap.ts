import { MetadataRoute } from 'next';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuración del cliente de Firebase (la misma que usas en el frontend)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase (evita duplicados)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://directorio-opticas-mx.vercel.app';

  // 1. 🏠 PÁGINAS ESTÁTICAS
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
    // ✅ Usamos el cliente de Firebase (no Admin)
    const snapshot = await getDocs(collection(db, 'opticas'));
    
    dynamicPages = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        
        // Saltar ópticas sin nombre
        if (!data.nombre) return null;
        
        const lastMod = data.updatedAt 
          ? new Date(data.updatedAt) 
          : new Date();
        
        // Prioridad basada en el plan
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
  } catch (error) {
    console.error('❌ OptiBoost: Error al generar el sitemap dinámico:', error);
  }

  // 3. 🚀 Unimos todo
  return [...staticPages, ...dynamicPages];
}