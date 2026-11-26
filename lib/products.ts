// Shared product schema + validation, used by BOTH the admin form (client-side)
// and the /api/admin/products route (server-side) so the rules never drift apart.

export const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Accessories",
  "Home & Garden",
  "Sports & Outdoors",
  "Books",
  "Toys & Games",
  "Health & Beauty",
  "Automotive",
  "Other",
] as const;

export const CURRENCIES = ["USD", "EUR", "GBP", "TRY", "CAD", "AUD", "JPY"] as const;

export interface ProductInput {
  title: string;
  description: string;
  brand: string;
  serialNumber: string;
  price: { amount: number; currency: string };
  taxRate: number;
  category: string;
  stock: number;
  imageUrl?: string;
  draft: boolean;
}

export interface Product extends ProductInput {
  id: string;
  createdAt: string;
  createdBy: string;
}

export type ProductField =
  | "title"
  | "description"
  | "brand"
  | "serialNumber"
  | "priceAmount"
  | "priceCurrency"
  | "taxRate"
  | "category"
  | "stock"
  | "imageUrl"
  | "draft";

export type ProductErrors = Partial<Record<ProductField, string>>;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const decimals = (n: number) => {
  const s = String(n);
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
};

/**
 * Validates an untrusted payload. Returns either the normalized product
 * input or a map of field -> human readable error message.
 */
export function validateProduct(
  raw: unknown
): { ok: true; data: ProductInput } | { ok: false; errors: ProductErrors } {
  const errors: ProductErrors = {};
  const body = isObject(raw) ? raw : {};
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const title = str(body.title);
  if (!title) errors.title = "Product title is required";
  else if (title.length < 3) errors.title = "Title must be at least 3 characters";
  else if (title.length > 100) errors.title = "Title must be at most 100 characters";

  const description = str(body.description);
  if (!description) errors.description = "Description is required";
  else if (description.length < 10) errors.description = "Description must be at least 10 characters";
  else if (description.length > 2000) errors.description = "Description must be at most 2000 characters";

  const brand = str(body.brand);
  if (!brand) errors.brand = "Brand is required";
  else if (brand.length > 50) errors.brand = "Brand must be at most 50 characters";

  const serialNumber = str(body.serialNumber).toUpperCase();
  if (!serialNumber) errors.serialNumber = "Serial number / SKU is required";
  else if (!/^[A-Z0-9_-]+$/.test(serialNumber))
    errors.serialNumber = "Only letters, numbers, hyphens and underscores are allowed";
  else if (serialNumber.length > 50) errors.serialNumber = "Serial number must be at most 50 characters";

  const price = isObject(body.price) ? body.price : {};
  const amount = price.amount;
  if (typeof amount !== "number" || !Number.isFinite(amount)) errors.priceAmount = "Price must be a valid number";
  else if (amount <= 0) errors.priceAmount = "Price must be greater than 0";
  else if (amount > 999999.99) errors.priceAmount = "Price cannot exceed 999,999.99";
  else if (decimals(amount) > 2) errors.priceAmount = "Price can have at most 2 decimal places";

  const currency = str(price.currency).toUpperCase();
  if (!(CURRENCIES as readonly string[]).includes(currency))
    errors.priceCurrency = `Currency must be one of: ${CURRENCIES.join(", ")}`;

  const taxRate = body.taxRate;
  if (typeof taxRate !== "number" || !Number.isFinite(taxRate)) errors.taxRate = "Tax rate must be a valid number";
  else if (taxRate < 0 || taxRate > 100) errors.taxRate = "Tax rate must be between 0 and 100";
  else if (decimals(taxRate) > 4) errors.taxRate = "Tax rate can have at most 4 decimal places";

  const category = str(body.category);
  if (!category) errors.category = "Category is required";
  else if (!(CATEGORIES as readonly string[]).includes(category)) errors.category = "Please choose a valid category";

  const stock = body.stock;
  if (typeof stock !== "number" || !Number.isInteger(stock)) errors.stock = "Stock must be a whole number";
  else if (stock < 0) errors.stock = "Stock cannot be negative";
  else if (stock > 999999) errors.stock = "Stock cannot exceed 999,999";

  const imageUrl = str(body.imageUrl);
  if (imageUrl) {
    try {
      const u = new URL(imageUrl);
      if (u.protocol !== "https:" && u.protocol !== "http:") errors.imageUrl = "Image URL must start with http(s)://";
    } catch {
      errors.imageUrl = "Please enter a valid URL";
    }
  }

  if (body.draft !== undefined && typeof body.draft !== "boolean") errors.draft = "Draft must be true or false";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      title,
      description,
      brand,
      serialNumber,
      price: { amount: amount as number, currency },
      taxRate: taxRate as number,
      category,
      stock: stock as number,
      imageUrl: imageUrl || undefined,
      draft: body.draft === undefined ? false : (body.draft as boolean),
    },
  };
}
