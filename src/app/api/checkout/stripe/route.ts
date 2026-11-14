import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { 
      plan, 
      opticaId, 
      userEmail, 
      userId, 
      billingCycle = 'monthly',
      incluirPoliza = false,
      polizaBillingCycle = 'monthly'
    } = await request.json();

    if (!plan || !opticaId || !userEmail) {
      return NextResponse.json(
        { error: 'plan, opticaId y userEmail son requeridos' },
        { status: 400 }
      );
    }

    // Mapeo de precios del plan (respeta la nomenclatura existente del proyecto)
    const priceMap: Record<string, Record<string, string | undefined>> = {
      premium: {
        monthly: process.env.STRIPE_PRICE_PREMIUM,
        yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
      },
      premium_plus: {
        monthly: process.env.STRIPE_PRICE_PREMIUM_PLUS,
        yearly: process.env.STRIPE_PRICE_PREMIUM_PLUS_YEARLY,
      },
    };

    const priceId = priceMap[plan]?.[billingCycle];

    if (!priceId) {
      return NextResponse.json(
        { error: `No hay precio configurado para plan=${plan} y ciclo=${billingCycle}. Revisa las variables de entorno.` },
        { status: 500 }
      );
    }

    // Construcción de line_items: 1 (solo plan) o 2 (plan + póliza)
    const lineItems: Array<{ price: string; quantity: number }> = [
      { price: priceId, quantity: 1 },
    ];

    if (incluirPoliza) {
      const polizaPriceMap: Record<string, string | undefined> = {
        monthly: process.env.STRIPE_PRICE_POLIZA_MONTHLY,
        yearly: process.env.STRIPE_PRICE_POLIZA_YEARLY,
      };
      const polizaPriceId = polizaPriceMap[polizaBillingCycle];

      if (!polizaPriceId) {
        return NextResponse.json(
          { error: `No hay precio configurado para póliza ciclo=${polizaBillingCycle}. Revisa las variables de entorno.` },
          { status: 500 }
        );
      }

      lineItems.push({ price: polizaPriceId, quantity: 1 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&opticaId=${opticaId}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: {
        opticaId,
        plan,
        userId: userId || '',
        billingCycle,
        incluirPoliza: incluirPoliza ? 'true' : 'false',
        polizaBillingCycle: incluirPoliza ? polizaBillingCycle : '',
      },
      customer_email: userEmail,
      client_reference_id: opticaId,
    });

    return NextResponse.json({ url: checkoutSession.url, sessionId: checkoutSession.id });
  } catch (error: any) {
    console.error('Error creando sesión de Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
}