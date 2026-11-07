import * as admin from "firebase-admin";

// Verificamos que las variables de entorno existan para evitar errores silenciosos
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
  console.warn("⚠️ Advertencia: Faltan variables de entorno de Firebase Admin. La API de creación de ópticas no funcionará.");
}

// Inicializamos solo si no hay apps corriendo
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();