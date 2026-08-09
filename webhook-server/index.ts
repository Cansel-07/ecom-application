import express from 'express';
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
});
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

interface OrderItem {
  id: string;
  quantity: number;
}

app.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId || null;
    const userEmail = session.metadata?.userEmail || session.customer_details?.email || 'customer@example.com';
    const orderItemsRaw = session.metadata?.orderItems;

    if (orderItemsRaw) {
      try {
        const items: OrderItem[] = JSON.parse(orderItemsRaw);

        for (const item of items) {
          await prisma.product.update({
            where: { id: item.id },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        const order = await prisma.order.create({
          data: {
            userId: userId,
            userEmail: userEmail,
            stripeSessionId: session.id,
            totalAmount: (session.amount_total || 0) / 100,
            items: JSON.parse(JSON.stringify(items)),
          },
        });

        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: userEmail,
            subject: 'Order Confirmation - Ecom App',
            html: `<h1>Thank you for your order!</h1><p>Your order ID is <strong>${order.id}</strong>.</p><p>Total Amount: $${order.totalAmount}</p>`,
          });
        }

        console.log(`Order processed and email sent for session: ${session.id}`);
      } catch (error) {
        console.error('Error processing webhook order:', error);
      }
    }
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});