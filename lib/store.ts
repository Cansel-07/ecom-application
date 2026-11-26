import type { Product } from "./products";
import type { ProfileSettings } from "./profile";

// Temporary in-memory storage until a real database is wired in.
// Kept on globalThis so data survives hot reloads in `next dev`.
// NOTE: data is lost when the server restarts.
const g = globalThis as typeof globalThis & {
  __ecomStore?: { products: Map<string, Product>; profiles: Map<string, ProfileSettings> };
};

export const store = (g.__ecomStore ??= { products: new Map(), profiles: new Map() });

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`;

const seed = (
  n: number,
  p: Pick<Product, "title" | "description" | "brand" | "category" | "imageUrl"> & { price: number }
): Product => ({
  id: `seed_${n}`,
  title: p.title,
  description: p.description,
  brand: p.brand,
  serialNumber: `SEED-${String(n).padStart(3, "0")}`,
  price: { amount: p.price, currency: "USD" },
  taxRate: 0,
  category: p.category,
  stock: 50,
  imageUrl: p.imageUrl,
  draft: false,
  createdAt: new Date(Date.UTC(2026, 0, n)).toISOString(),
  createdBy: "system",
});

const SEED_PRODUCTS: Product[] = [
  seed(1, {
    title: "Minimalist Leather Watch",
    description: "Handcrafted leather strap watch with a clean analog face.",
    brand: "MiniCommerce",
    price: 129,
    category: "Accessories",
    imageUrl: img("1523275335684-37898b6baf30"),
  }),
  seed(2, {
    title: "Wireless Noise-Canceling Headphones",
    description: "Immersive sound with active noise cancellation for long listening sessions.",
    brand: "MiniCommerce",
    price: 249,
    category: "Electronics",
    imageUrl: img("1505740420928-5e560c06d30e"),
  }),
  seed(3, {
    title: "Canvas Backpack",
    description: "Durable canvas backpack with padded laptop compartment.",
    brand: "MiniCommerce",
    price: 89,
    category: "Accessories",
    imageUrl: img("1553062407-98eeb64c6a62"),
  }),
  seed(4, {
    title: "Ceramic Coffee Mug",
    description: "Microwave-safe ceramic mug, keeps your coffee warm longer.",
    brand: "MiniCommerce",
    price: 18,
    category: "Home & Garden",
    imageUrl: img("1514432324607-a09d9b4aefdd"),
  }),
  seed(5, {
    title: "Mechanical Keyboard",
    description: "Tactile mechanical switches with RGB backlighting.",
    brand: "MiniCommerce",
    price: 159,
    category: "Electronics",
    imageUrl: img("1595225476474-87563907a212"),
  }),
  seed(6, {
    title: "Stainless Steel Water Bottle",
    description: "Insulated bottle keeps drinks cold for 24 hours.",
    brand: "MiniCommerce",
    price: 34,
    category: "Home & Garden",
    imageUrl: img("1602143407151-7111542de6e8"),
  }),
];

// Seed the catalog once (also refreshes seeds in a store created before seeding existed).
for (const p of SEED_PRODUCTS) store.products.set(p.id, p);

/** Published (non-draft) products for the storefront, newest first. */
export function getStorefrontProducts(): Product[] {
  return [...store.products.values()]
    .filter((p) => !p.draft)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
