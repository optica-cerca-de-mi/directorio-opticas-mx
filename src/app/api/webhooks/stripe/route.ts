import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // Obtener el body como texto (necesario para verificar la firma)
    const body = await request.text();
    
    // Obtener la firma del header
    const signature = request.headers.get('stripe-signature') || '';

    // Verificar la firma del webhook
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.error('❌ Error verificando firma del webhook:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Manejar el evento de checkout completado
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      // Extraer datos del metadata
      const { opticaId, plan, userId } = session.metadata;
      const paymentStatus = session.payment_status;

      if (!opticaId || !plan) {
        console.error('❌ Metadata incompleto en la sesión:', session.metadata);
        return NextResponse.json({ error: 'Metadata incompleto' }, { status: 400 });
      }

      // Calcular fechas
      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 días

      // Actualizar la óptica en Firestore
      const opticaRef = doc(db, 'opticas', opticaId);
      await updateDoc(opticaRef, {
        plan: plan,
        planStatus: 'active',
        planStartDate: now.toISOString(),
        planEndDate: endDate.toISOString(),
        stripeSessionId: session.id,
        stripePaymentStatus: paymentStatus,
        stripeCustomerId: session.customer || null,
        planRenewalReminderSent: false,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Plan activado para óptica:', opticaId, 'Plan:', plan);
    }

    // Manejar pago fallido
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as any;
      const opticaId = paymentIntent.metadata?.opticaId;

      if (opticaId) {
        const opticaRef = doc(db, 'opticas', opticaId);
        await updateDoc(opticaRef, {
          lastPaymentStatus: 'failed',
          lastPaymentError: paymentIntent.last_payment_error?.message || 'Pago fallido',
          updatedAt: serverTimestamp(),
        });
        console.log('⚠️ Pago fallido para óptica:', opticaId);
      }
    }

    // Retornar 200 para confirmar recepción
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Error en webhook de Stripe:', error);
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}