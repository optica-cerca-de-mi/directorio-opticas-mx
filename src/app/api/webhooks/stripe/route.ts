import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Error de firma de Stripe: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const eventId = event.id;
  const eventDoc = await db.collection("webhook_events").doc(eventId).get();

  if (eventDoc.exists) {
    console.log(`Evento ${eventId} ya procesado anteriormente. Ignorando.`);
    return new NextResponse("OK", { status: 200 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { 
        userId, 
        opticaId, 
        plan, 
        billingCycle = 'monthly',
        incluirPoliza = 'false',
        polizaBillingCycle = 'monthly'
      } = session.metadata || {};

      if (!opticaId || !plan) {
        throw new Error("Faltan metadatos críticos (opticaId, plan) en la sesión de Stripe");
      }

      const tienePoliza = incluirPoliza === 'true';
      const diasPlan = billingCycle === "yearly" ? 365 : 30;
      const fechaVencimientoPlan = new Date();
      fechaVencimientoPlan.setDate(fechaVencimientoPlan.getDate() + diasPlan);

      // 1. Actualizar la ficha de la óptica
      const updateData: any = {
        plan,
        billingCycle,
        fechaVencimiento: fechaVencimientoPlan.toISOString(),
        estado: "activa",
        stripeSessionId: session.id,
        fechaUltimoPago: new Date().toISOString(),
      };

      if (tienePoliza) {
        const diasPoliza = polizaBillingCycle === "yearly" ? 365 : 30;
        const fechaVencimientoPoliza = new Date();
        fechaVencimientoPoliza.setDate(fechaVencimientoPoliza.getDate() + diasPoliza);
        updateData.polizaActiva = true;
        updateData.polizaBillingCycle = polizaBillingCycle;
        updateData.fechaVencimientoPoliza = fechaVencimientoPoliza.toISOString();
      }

      await db.collection("opticas").doc(opticaId).update(updateData);

      // 2. Registrar factura del plan
      const planAmount = session.amount_total || 0;
      await db.collection("facturas").add({
        opticaId,
        userId: userId || null,
        stripeSessionId: session.id,
        stripeSubscriptionId: session.subscription || null,
        monto: planAmount,
        moneda: session.currency || 'mxn',
        plan,
        cicloFacturacion: billingCycle,
        estado: 'paid',
        tipo: 'plan',
        fechaPago: new Date().toISOString(),
        fechaVencimiento: fechaVencimientoPlan.toISOString(),
        createdAt: new Date().toISOString(),
      });

      // 3. Si incluye póliza, registrar factura separada para la póliza
      if (tienePoliza) {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const polizaItem = lineItems.data.find((item: any) => 
          item.price?.id === process.env.STRIPE_PRICE_POLIZA_MONTHLY || 
          item.price?.id === process.env.STRIPE_PRICE_POLIZA_YEARLY
        );

        if (polizaItem) {
          const diasPoliza = polizaBillingCycle === "yearly" ? 365 : 30;
          const fechaVencimientoPoliza = new Date();
          fechaVencimientoPoliza.setDate(fechaVencimientoPoliza.getDate() + diasPoliza);

          await db.collection("facturas").add({
            opticaId,
            userId: userId || null,
            stripeSessionId: session.id,
            stripeSubscriptionId: session.subscription || null,
            monto: polizaItem.amount_total || 0,
            moneda: session.currency || 'mxn',
            plan: 'poliza',
            cicloFacturacion: polizaBillingCycle,
            estado: 'paid',
            tipo: 'poliza',
            fechaPago: new Date().toISOString(),
            fechaVencimiento: fechaVencimientoPoliza.toISOString(),
            createdAt: new Date().toISOString(),
          });
        }
      }

      console.log(`Plan ${plan} (${billingCycle}) activado${tienePoliza ? ' + póliza' : ''} para óptica: ${opticaId}`);
    }

    // 4. Marcar como procesado
    await db.collection("webhook_events").doc(eventId).set({
      processedAt: new Date().toISOString(),
      type: event.type,
      sessionId: event.type === "checkout.session.completed" ? (event.data.object as Stripe.Checkout.Session).id : null,
    });

    return new NextResponse("OK", { status: 200 });

  } catch (error: any) {
    console.error("Error procesando el evento del webhook:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}