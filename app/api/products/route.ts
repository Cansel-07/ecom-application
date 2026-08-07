import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

function isValidHttpUrl(stringUrl?: string) {
  if (!stringUrl) return false;
  try {
    const url = new URL(stringUrl);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, price, imageUrl } = body;

    if (!title || !description || !price) {
      return NextResponse.json(
        { error: "Title, description, and price are required." },
        { status: 400 }
      );
    }

    const validImages = isValidHttpUrl(imageUrl) ? [imageUrl] : [];

    const stripeProduct = await stripe.products.create({
      name: title,
      description: description,
      images: validImages,
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(Number(price) * 100),
      currency: "usd",
    });

    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price: Number(price),
        imageUrl: imageUrl || null,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product in Stripe/MongoDB:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}