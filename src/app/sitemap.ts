import { MetadataRoute } from 'next';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuración del cliente de Firebase
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
      url: `${baseUrl}/estados`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
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
    {
      url: `${baseUrl}/terminos-y-condiciones`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/aviso-de-privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-de-cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-de-reembolsos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. 🏪 PÁGINAS DINÁMICAS (Fichas de Ópticas)
  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    // Traemos TODAS las ópticas (Free, Premium y Premium+)
    const snapshot = await getDocs(collection(db, 'opticas'));
    
    dynamicPages = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        
        // Saltar ópticas sin nombre (datos corruptos)
        if (!data.nombre) return null;
        
        const lastMod = data.updatedAt 
          ? new Date(data.updatedAt) 
          : new Date();
        
        // ✅ ESTRATEGIA DE PRIORIZACIÓN POR PLAN
        let priority = 0.5; // Free por defecto
        let changeFrequency: 'weekly' | 'monthly' = 'monthly';
        
        if (data.plan === 'premium_plus') {
          priority = 0.9;
          changeFrequency = 'weekly';
        } else if (data.plan === 'premium') {
          priority = 0.8;
          changeFrequency = 'weekly';
        }
        // Free se queda en 0.5 y 'monthly'
        
        return {
          url: `${baseUrl}/opticas/${doc.id}`,
          lastModified: lastMod,
          changeFrequency,
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