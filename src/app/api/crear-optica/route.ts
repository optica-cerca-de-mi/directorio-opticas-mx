import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { uid, email, idToken, formData } = await req.json();

    // 1. Verificar que Firestore Admin esté disponible
    if (!db) {
      return NextResponse.json(
        { error: "Error interno: Firebase Admin no está inicializado en el servidor." },
        { status: 500 }
      );
    }

    // 2. Verificar autenticación vía REST de Google (sin firebase-admin/auth,
    //    para evitar el crash de jose/jwks-rsa en el runtime de Vercel).
    console.log("🔐 [AUTH] idToken presente:", !!idToken, "| longitud:", idToken ? idToken.length : 0);
    console.log("🔐 [AUTH] uid recibido:", uid);
    console.log("🔐 [AUTH] FIREBASE_PROJECT_ID env:", process.env.FIREBASE_PROJECT_ID);

    if (!idToken) {
      console.log("🔐 [AUTH] FALLA: no llegó idToken en el body");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    let claims: any = null;
    try {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      console.log("🔐 [AUTH] tokeninfo status:", verifyRes.status);
      if (!verifyRes.ok) {
        console.log("🔐 [AUTH] FALLA: tokeninfo devolvió", verifyRes.status);
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      claims = await verifyRes.json();
    } catch (e: any) {
      console.log("🔐 [AUTH] FALLA: fetch a tokeninfo lanzó:", e.message);
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Validar que el token corresponde a este proyecto y a este uid
    const expectedIss = `https://securetoken.google.com/${projectId}`;
    console.log("🔐 [AUTH] claims.iss:", claims?.iss, "| esperado:", expectedIss);
    console.log("🔐 [AUTH] claims.aud:", claims?.aud, "| esperado:", projectId);
    console.log("🔐 [AUTH] claims.sub:", claims?.sub, "| uid:", uid);

    if (!claims || claims.iss !== expectedIss || claims.aud !== projectId || claims.sub !== uid) {
      console.log("🔐 [AUTH] FALLA: discrepancia en iss/aud/sub");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    console.log("🔐 [AUTH] ✅ Verificación de token exitosa");

    // 3. Contar cuántas ópticas tiene ya este usuario
    const opticasSnapshot = await db.collection("opticas").where("uid", "==", uid).get();
    const numOpticas = opticasSnapshot.size;

    // 4. Validar límites del plan
    const limites: Record<string, number> = { free: 1, premium: 3, premium_plus: 3 };
    const limite = limites[formData.planSeleccionado] || 1;

    if (numOpticas >= limite) {
      return NextResponse.json({
        error: `Has alcanzado el límite de ${limite} ópticas para tu plan actual. Considera actualizar tu plan.`
      }, { status: 403 });
    }

    // 5. Validar unicidad de teléfono (en toda la base de datos)
    const phoneSnapshot = await db.collection("opticas").where("telefono", "==", formData.telefono).get();
    if (!phoneSnapshot.empty) {
      return NextResponse.json({ error: "Este número de teléfono ya está registrado en otra óptica." }, { status: 409 });
    }

    // 6. Validar unicidad de Google Maps Link (en toda la base de datos)
    const mapsSnapshot = await db.collection("opticas").where("googleMapsLink", "==", formData.googleMapsLink).get();
    if (!mapsSnapshot.empty) {
      return NextResponse.json({ error: "Este enlace de Google Maps ya está asociado a otra óptica." }, { status: 409 });
    }

    // 7. Preparar datos de la óptica
    const opticaId = crypto.randomUUID();
    const slug = `${formData.nombre.toLowerCase().replace(/\s+/g, "-")}-${opticaId.slice(0, 6)}`;

    const diasDePlan = formData.billingCycle === "yearly" ? 365 : 30;
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasDePlan);

    let polizaVencimiento = null;
    if (formData.aceptaPoliza) {
      const diasPoliza = formData.polizaBillingCycle === "yearly" ? 365 : 30;
      polizaVencimiento = new Date();
      polizaVencimiento.setDate(polizaVencimiento.getDate() + diasPoliza);
    }

    const ahoraISO = new Date().toISOString();

    // 8. Guardar en Firestore de forma segura
    await db.collection("opticas").doc(opticaId).set({
      uid: uid,
      slug: slug,
      nombre: formData.nombre,
      direccion: formData.direccion,
      ciudad: formData.ciudad,
      estado: formData.estado,
      telefono: formData.telefono,
      googleMapsLink: formData.googleMapsLink,
      horarios: formData.horarios,
      whatsapp: formData.whatsapp,
      sitioWeb: formData.sitioWeb,
      facebook: formData.facebook,
      instagram: formData.instagram,
      especialidades: formData.especialidades,
      segurosAceptados: formData.segurosAceptados,
      descripcion: formData.descripcion,
      fotos: formData.fotos,
      videoUrl: formData.videoUrl,
      plan: formData.planSeleccionado,
      billingCycle: formData.billingCycle,
      polizaActiva: formData.aceptaPoliza || false,
      polizaBillingCycle: formData.aceptaPoliza ? formData.polizaBillingCycle : null,
      polizaVencimiento: polizaVencimiento ? polizaVencimiento.toISOString() : null,
      fechaCreacion: ahoraISO,
      fechaVencimiento: fechaVencimiento.toISOString(),
      estadoCuenta: "activa",
      email: email,
      consentimientoTerminos: true,
      fechaConsentimiento: ahoraISO,
    });

    return NextResponse.json({ success: true, opticaId });

  } catch (error: any) {
    console.error("Error en API crear-optica:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}