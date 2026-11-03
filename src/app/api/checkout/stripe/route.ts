import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Obtener datos del request (el usuario ya está autenticado del lado del cliente)
    const { plan, opticaId, userEmail, userId } = await request.json();

    // Validar datos requeridos
    if (!plan || !opticaId || !userEmail) {
      return NextResponse.json(
        { error: 'plan, opticaId y userEmail son requeridos' },
        { status: 400 }
      );
    }

    // Determinar el priceId según el plan
    const priceId = plan === 'premium' 
      ? process.env.STRIPE_PRICE_PREMIUM
      : process.env.STRIPE_PRICE_PREMIUM_PLUS;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Plan no configurado correctamente' },
        { status: 500 }
      );
    }

    // Obtener URL base de la app
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // Crear sesión de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment', // Pago único (NO recurrente)
      payment_method_types: ['card', 'oxxo'], // Tarjeta y OXXO
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&opticaId=${opticaId}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: {
        opticaId: opticaId,
        plan: plan,
        userId: userId || '',
      },
      customer_email: userEmail,
      client_reference_id: opticaId,
    });

    // Retornar la URL de checkout
    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id 
    });

  } catch (error) {
    console.error('❌ Error creando sesión de Stripe:', error);
    return NextResponse.json(
      { error: 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
}