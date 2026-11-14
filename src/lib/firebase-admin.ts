import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function ensureAdminInitialized(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    console.warn(
      "⚠️ Firebase Admin: faltan variables de entorno. Revisa FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY."
    );
    return false;
  }

  if (getApps().length > 0) return true;

  try {
    const privateKey = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    console.log("✅ Firebase Admin inicializado correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error inicializando Firebase Admin:", error);
    return false;
  }
}

const initialized = ensureAdminInitialized();

// Solo Firestore. Se elimina getAuth/auth para evitar el crash de
// jose/jwks-rsa (ESM) al cargar firebase-admin/auth en el runtime de Vercel.
export const db = initialized ? getFirestore() : null;