import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase-admin"; // Usamos la configuración que ya arreglamos

// Inicializar Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Ajusta a la versión que estés usando en tu proyecto
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  // 1. Verificar que el evento venga realmente de Stripe
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Error de firma de Stripe: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 2. ✅ VERIFICACIÓN DE IDEMPOTENCIA
  // Revisamos si ya procesamos este evento exacto (por su ID único)
  const eventId = event.id;
  const eventDoc = await db.collection("webhook_events").doc(eventId).get();
  
  if (eventDoc.exists) {
    console.log(`⚠️ Evento ${eventId} ya procesado anteriormente. Ignorando para evitar duplicados.`);
    return new NextResponse("OK", { status: 200 });
  }

  try {
    // 3. PROCESAMIENTO DEL EVENTO
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extraemos los metadatos que enviamos desde el frontend
      const { userId, opticaId, plan, billingCycle } = session.metadata || {};

      if (!userId || !opticaId || !plan) {
        throw new Error("Faltan metadatos críticos (userId, opticaId, plan) en la sesión de Stripe");
      }

      // Calculamos la nueva fecha de vencimiento
      const dias = billingCycle === "yearly" ? 365 : 30;
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + dias);

      // Actualizamos la ficha de la óptica en Firestore
      await db.collection("opticas").doc(opticaId).update({
        plan: plan,
        billingCycle: billingCycle,
        fechaVencimiento: fechaVencimiento.toISOString(),
        estado: "activa",
        stripeSessionId: session.id,
        fechaUltimoPago: new Date().toISOString(),
      });
      
      console.log(`✅ Plan ${plan} (${billingCycle}) activado exitosamente para la óptica: ${opticaId}`);
    }

    // 4. ✅ MARCAR COMO PROCESADO (Solo si todo lo anterior salió bien)
    await db.collection("webhook_events").doc(eventId).set({
      processedAt: new Date().toISOString(),
      type: event.type,
      sessionId: event.type === "checkout.session.completed" ? (event.data.object as Stripe.Checkout.Session).id : null,
    });

    // Devolvemos 200 OK para que Stripe sepa que lo recibimos correctamente
    return new NextResponse("OK", { status: 200 });

  } catch (error: any) {
    console.error("❌ Error procesando el evento del webhook:", error);
    // ⚠️ IMPORTANTE: Si falla, NO lo marcamos como procesado. 
    // Así Stripe podrá reintentar enviar el evento más tarde.
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}