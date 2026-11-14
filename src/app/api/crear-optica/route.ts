import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { uid, email, formData } = await req.json();

    // 1. Verificar que el usuario exista y esté autenticado
    if (!auth) {
      return NextResponse.json(
        { error: "Error interno: Firebase Admin no está inicializado en el servidor." },
        { status: 500 }
      );
    }

    try {
      await auth.getUser(uid);
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    // 2. Contar cuántas ópticas tiene ya este usuario
    const opticasSnapshot = await db.collection("opticas").where("uid", "==", uid).get();
    const numOpticas = opticasSnapshot.size;

    // 3. Validar límites del plan
    const limites: Record<string, number> = { free: 1, premium: 3, premium_plus: 3 };
    const limite = limites[formData.planSeleccionado] || 1;

    if (numOpticas >= limite) {
      return NextResponse.json({ 
        error: `Has alcanzado el límite de ${limite} ópticas para tu plan actual. Considera actualizar tu plan.` 
      }, { status: 403 });
    }

    // 4. Validar unicidad de teléfono (en toda la base de datos)
    const phoneSnapshot = await db.collection("opticas").where("telefono", "==", formData.telefono).get();
    if (!phoneSnapshot.empty) {
      return NextResponse.json({ error: "Este número de teléfono ya está registrado en otra óptica." }, { status: 409 });
    }

    // 5. Validar unicidad de Google Maps Link (en toda la base de datos)
    const mapsSnapshot = await db.collection("opticas").where("googleMapsLink", "==", formData.googleMapsLink).get();
    if (!mapsSnapshot.empty) {
      return NextResponse.json({ error: "Este enlace de Google Maps ya está asociado a otra óptica." }, { status: 409 });
    }

    // 6. Preparar datos de la óptica
    const opticaId = crypto.randomUUID(); // ID único para la óptica (permite múltiples por usuario)
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

    // 7. Guardar en Firestore de forma segura
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
      polizaActiva: formData.aceptaPoliza,
      polizaBillingCycle: formData.aceptaPoliza ? formData.polizaBillingCycle : null,
      polizaVencimiento: polizaVencimiento ? polizaVencimiento.toISOString() : null,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaVencimiento: fechaVencimiento.toISOString(),
      estado: "activa",
      email: email,
      consentimientoTerminos: true,
      fechaConsentimiento: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, opticaId });

  } catch (error: any) {
    console.error("Error en API crear-optica:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}