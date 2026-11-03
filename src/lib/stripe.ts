import Stripe from 'stripe';

// Crear instancia de Stripe solo del lado del servidor
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-10-28.endive', // Usa la misma versión que configuraste en Stripe
});

export default stripe;