import * as admin from "firebase-admin";

// ✅ Solución definitiva: Evita el error "Cannot read properties of undefined" en Vercel
const apps = (admin as any).apps || [];

if (apps.length === 0 && process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Reemplaza los \n literales por saltos de línea reales
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("❌ Error al inicializar Firebase Admin:", error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();