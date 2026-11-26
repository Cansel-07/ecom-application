import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth0 } from "@/lib/auth0";
import { validateProduct, type Product } from "@/lib/products";
import { store } from "@/lib/store";

const fail = (status: number, message: string, errors?: Record<string, string>) =>
  NextResponse.json({ success: false, message, ...(errors ? { errors } : {}) }, { status });

export async function GET() {
  const session = await auth0.getSession();
  if (!session) return fail(401, "You must be logged in to view products.");
  return NextResponse.json({ success: true, products: [...store.products.values()] });
}

export async function POST(request: Request) {
  try {
    // 401 – defense in depth (proxy.ts already blocks anonymous requests).
    // Admin role check will be added in the next lesson.
    const session = await auth0.getSession();
    if (!session) return fail(401, "You must be logged in to create products.");

    // 415 – only JSON bodies are accepted
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return fail(415, "Content-Type must be application/json.");
    }

    // 400 – malformed JSON
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, "Request body is not valid JSON.");
    }

    // 422 – well-formed but semantically invalid data, with per-field messages
    const result = validateProduct(body);
    if (!result.ok) {
      return fail(422, "Please fix the highlighted fields and try again.", result.errors);
    }

    // 409 – SKU must be unique
    const duplicate = [...store.products.values()].some(
      (p) => p.serialNumber === result.data.serialNumber
    );
    if (duplicate) {
      return fail(409, `A product with SKU "${result.data.serialNumber}" already exists.`, {
        serialNumber: "This serial number / SKU is already in use",
      });
    }

    const product: Product = {
      ...result.data,
      id: `prod_${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      createdBy: session.user.sub,
    };
    store.products.set(product.id, product);
    // Make sure the storefront doesn't serve a stale cached copy of the product list.
    revalidatePath("/");

    // 201 – created
    return NextResponse.json(
      { success: true, message: `"${product.title}" was created successfully.`, product },
      { status: 201, headers: { Location: `/api/admin/products/${product.id}` } }
    );
  } catch (error) {
    // 500 – unexpected failure; don't leak internals to the client
    console.error("POST /api/admin/products failed:", error);
    return fail(500, "Something went wrong on our side. Please try again later.");
  }
}
