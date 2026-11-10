import { MetadataRoute } from 'next';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuración del cliente de Firebase (usa las mismas variables de entorno que tu app)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase solo si no está ya inicializado
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// ═══════════════════════════════════════════════════════
// ✅ CACHE EN MEMORIA (evita golpear Firebase en cada request)
// ═══════════════════════════════════════════════════════
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 3600 * 1000; // 1 hora en milisegundos
let opticasCache: CacheEntry<MetadataRoute.Sitemap> | null = null;

function isCacheValid<T>(cache: CacheEntry<T> | null): cache is CacheEntry<T> {
  return cache !== null && (Date.now() - cache.timestamp) < CACHE_TTL;
}

// ═══════════════════════════════════════════════════════
// ✅ CONFIGURACIÓN DE REVALIDACIÓN (Next.js ISR)
// ═══════════════════════════════════════════════════════
export const revalidate = 3600; // Revalidar cada hora automáticamente

// ═══════════════════════════════════════════════════════
// MAIN SITEMAP
// ═══════════════════════════════════════════════════════
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://directorio-opticas-mx.vercel.app';

  // 1. 🏠 PÁGINAS ESTÁTICAS (Core)
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/opticas`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/estados`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/planes`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/ayuda`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contacto-publicidad`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 2. 🏪 PÁGINAS DINÁMICAS (Ópticas) - CON CACHÉ
  let opticasPages: MetadataRoute.Sitemap = [];

  if (isCacheValid(opticasCache)) {
    opticasPages = opticasCache.data;
    console.log('✅ OptiBoost: Ópticas servidas desde caché (ahorro de lectura en Firebase)');
  } else {
    try {
      const snapshot = await getDocs(collection(db, 'opticas'));

      opticasPages = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          // Filtrar ópticas inactivas o eliminadas
          if (!data.nombre || data.estado === 'inactiva' || data.estado === 'eliminada') return null;

          const lastMod = data.updatedAt ? new Date(data.updatedAt) : new Date();

          // ✅ SCORE DINÁMICO basado en múltiples factores
          const score = calculateOpticaScore(data);

          return {
            url: `${baseUrl}/opticas/${data.slug || doc.id}`,
            lastModified: lastMod,
            changeFrequency: score >= 0.8 ? 'daily' : score >= 0.6 ? 'weekly' : 'monthly',
            priority: score,
          };
        })
        .filter((page): page is MetadataRoute.Sitemap[0] => page !== null);

      // ✅ Actualizar caché
      opticasCache = { data: opticasPages, timestamp: Date.now() };
      console.log(`✅ OptiBoost: ${opticasPages.length} ópticas indexadas y cacheadas.`);
    } catch (error) {
      console.error('❌ OptiBoost: Error al generar sitemap de ópticas:', error);
      // Fallback a array vacío en caso de error para no romper el build
      opticasPages = [];
    }
  }

  // 3. 🚀 UNIR TODO
  return [...staticPages, ...opticasPages];
}

// ═══════════════════════════════════════════════════════
// ✅ FUNCIÓN: Calcular score dinámico de una óptica (0.4 a 1.0)
// ═══════════════════════════════════════════════════════
function calculateOpticaScore(data: Record<string, unknown>): number {
  let score = 0.4; // Base mínima para cualquier óptica activa

  // Factor 1: Plan (hasta +0.3)
  if (data.plan === 'premium_plus') score += 0.3;
  else if (data.plan === 'premium') score += 0.2;

  // Factor 2: Completitud del perfil (hasta +0.15)
  const fields = ['nombre', 'telefono', 'direccion', 'ciudad', 'descripcion', 'fotos', 'horarios'];
  const filledFields = fields.filter(f => data[f] && (Array.isArray(data[f]) ? (data[f] as any[]).length > 0 : true));
  score += (filledFields.length / fields.length) * 0.15;

  // Factor 3: Reseñas (hasta +0.1)
  if (data.calificacionGoogle && data.numResenas) {
    score += Math.min((data.numResenas as number) / 50, 1) * 0.1;
  }

  // Factor 4: Antigüedad (hasta +0.05)
  if (data.fechaCreacion || data.createdAt) {
    const creationDate = new Date((data.fechaCreacion || data.createdAt) as string);
    const daysSinceCreation = (Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.min(daysSinceCreation / 365, 1) * 0.05;
  }

  return Math.min(score, 1.0); // Máximo 1.0
}