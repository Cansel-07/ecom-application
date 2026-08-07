import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
});

interface CheckoutItem {
  id: string;
  stripePriceId: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const { items, userId, userEmail } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const lineItems = items.map((item: CheckoutItem) => ({
      price: item.stripePriceId,
      quantity: item.quantity,
    }));

    const metadataItems = items.map((item: CheckoutItem) => ({
      id: item.id,
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId || '',
        userEmail: userEmail || '',
        orderItems: JSON.stringify(metadataItems),
      },
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}