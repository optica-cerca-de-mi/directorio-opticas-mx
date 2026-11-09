// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require("firebase-admin");

if (process.env.FIREBASE_PROJECT_ID && !admin.apps?.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // ✅ Sin replace, la clave ya tiene saltos de línea reales
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
    });
  } catch (error) {
    console.error("❌ Error inicializando Firebase Admin:", error);
  }
}

export const db = admin.firestore ? admin.firestore() : null;
export const auth = admin.auth ? admin.auth() : null;