"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Alert from "../../../components/Alert";
import Field from "../../../components/Field";
import {
  CATEGORIES,
  CURRENCIES,
  validateProduct,
  type Product,
  type ProductErrors,
  type ProductField,
} from "@/lib/products";

interface FormValues {
  title: string;
  description: string;
  brand: string;
  serialNumber: string;
  priceAmount: string;
  priceCurrency: string;
  taxRate: string;
  category: string;
  stock: string;
  imageUrl: string;
  draft: boolean;
}

const EMPTY: FormValues = {
  title: "",
  description: "",
  brand: "",
  serialNumber: "",
  priceAmount: "",
  priceCurrency: "USD",
  taxRate: "0",
  category: "",
  stock: "",
  imageUrl: "",
  draft: false,
};

type Status =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success"; message: string; product: Product }
  | { type: "error"; message: string };

/** Converts the string-based form into the API payload. Empty/garbage numbers become NaN so validation catches them. */
const toPayload = (v: FormValues) => {
  const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(",", ".")));
  return {
    title: v.title,
    description: v.description,
    brand: v.brand,
    serialNumber: v.serialNumber,
    price: { amount: num(v.priceAmount), currency: v.priceCurrency },
    taxRate: num(v.taxRate),
    category: v.category,
    stock: num(v.stock),
    imageUrl: v.imageUrl,
    draft: v.draft,
  };
};

export default function ProductForm() {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<ProductErrors>({});
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as ProductField]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const focusFirstError = (errs: ProductErrors) => {
    const first = Object.keys(errs)[0];
    if (first) formRef.current?.querySelector<HTMLElement>(`#${first}`)?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = toPayload(values);

    // 1) Client-side validation (shared rules with the server)
    const check = validateProduct(payload);
    if (!check.ok) {
      setErrors(check.errors);
      setStatus({ type: "error", message: "Please fix the highlighted fields before submitting." });
      focusFirstError(check.errors);
      return;
    }

    setErrors({});
    setStatus({ type: "submitting" });

    // 2) Send to the API and translate every failure into a readable message
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (data?.errors) {
          setErrors(data.errors);
          focusFirstError(data.errors);
        }
        const fallback: Record<number, string> = {
          401: "Your session has expired. Please log in again.",
          403: "You don't have permission to create products.",
          409: "A product with this SKU already exists.",
          422: "The server rejected some fields. Please check them.",
        };
        throw new Error(data?.message ?? fallback[res.status] ?? `Unexpected server error (${res.status}).`);
      }

      setStatus({ type: "success", message: data.message, product: data.product });
      setValues(EMPTY);
    } catch (err) {
      const message =
        err instanceof TypeError
          ? "Network error — please check your connection and try again."
          : err instanceof Error
            ? err.message
            : "Failed to create product. Please try again.";
      setStatus({ type: "error", message });
    } finally {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const describedBy = (f: ProductField) => (errors[f] ? `${f}-error` : undefined);
  const submitting = status.type === "submitting";

  return (
    <>
      {status.type === "success" && (
        <Alert variant="success">
          {status.message}{" "}
          <span className="font-normal">
            (ID: <code>{status.product.id}</code>, SKU: <code>{status.product.serialNumber}</code>
            {status.product.draft ? ", saved as draft" : ", published"})
          </span>
        </Alert>
      )}
      {status.type === "error" && <Alert variant="error">{status.message}</Alert>}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
        <fieldset className="card p-6" disabled={submitting}>
          <legend className="sr-only">Basic information</legend>
          <h2 className="mb-4 text-lg font-semibold">Basic information</h2>
          <div className="space-y-4">
            <Field id="title" label="Product title" required error={errors.title}>
              <input
                id="title"
                className="input"
                value={values.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Wireless Noise-Canceling Headphones"
                maxLength={100}
                aria-invalid={!!errors.title}
                aria-describedby={describedBy("title")}
              />
            </Field>

            <Field
              id="description"
              label="Description"
              required
              error={errors.description}
              hint={`${values.description.length}/2000 characters (min. 10)`}
            >
              <textarea
                id="description"
                className="input resize-y"
                rows={4}
                maxLength={2000}
                value={values.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe the product features, specifications and benefits…"
                aria-invalid={!!errors.description}
                aria-describedby={describedBy("description")}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="brand" label="Brand" required error={errors.brand}>
                <input
                  id="brand"
                  className="input"
                  value={values.brand}
                  onChange={(e) => update("brand", e.target.value)}
                  placeholder="e.g. Sony"
                  maxLength={50}
                  aria-invalid={!!errors.brand}
                  aria-describedby={describedBy("brand")}
                />
              </Field>
              <Field
                id="serialNumber"
                label="Serial number / SKU"
                required
                error={errors.serialNumber}
                hint="Letters, numbers, hyphens and underscores only"
              >
                <input
                  id="serialNumber"
                  className="input uppercase"
                  value={values.serialNumber}
                  onChange={(e) => update("serialNumber", e.target.value)}
                  placeholder="e.g. WH-1000XM5-BLK"
                  maxLength={50}
                  aria-invalid={!!errors.serialNumber}
                  aria-describedby={describedBy("serialNumber")}
                />
              </Field>
            </div>
          </div>
        </fieldset>

        <fieldset className="card p-6" disabled={submitting}>
          <legend className="sr-only">Pricing and tax</legend>
          <h2 className="mb-4 text-lg font-semibold">Pricing &amp; tax</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="priceAmount" label="Price" required error={errors.priceAmount} hint="Max. 2 decimal places">
              <input
                id="priceAmount"
                className="input"
                inputMode="decimal"
                value={values.priceAmount}
                onChange={(e) => update("priceAmount", e.target.value)}
                placeholder="e.g. 249.99"
                aria-invalid={!!errors.priceAmount}
                aria-describedby={describedBy("priceAmount")}
              />
            </Field>
            <Field id="priceCurrency" label="Currency" required error={errors.priceCurrency}>
              <select
                id="priceCurrency"
                className="input"
                value={values.priceCurrency}
                onChange={(e) => update("priceCurrency", e.target.value)}
                aria-invalid={!!errors.priceCurrency}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="taxRate" label="Tax rate (%)" required error={errors.taxRate} hint="0 – 100, e.g. 18">
              <input
                id="taxRate"
                className="input"
                inputMode="decimal"
                value={values.taxRate}
                onChange={(e) => update("taxRate", e.target.value)}
                placeholder="e.g. 18"
                aria-invalid={!!errors.taxRate}
                aria-describedby={describedBy("taxRate")}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="card p-6" disabled={submitting}>
          <legend className="sr-only">Inventory and category</legend>
          <h2 className="mb-4 text-lg font-semibold">Inventory &amp; category</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="category" label="Category" required error={errors.category}>
              <select
                id="category"
                className="input"
                value={values.category}
                onChange={(e) => update("category", e.target.value)}
                aria-invalid={!!errors.category}
                aria-describedby={describedBy("category")}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="stock" label="Stock quantity" required error={errors.stock} hint="Whole number">
              <input
                id="stock"
                className="input"
                inputMode="numeric"
                value={values.stock}
                onChange={(e) => update("stock", e.target.value)}
                placeholder="e.g. 100"
                aria-invalid={!!errors.stock}
                aria-describedby={describedBy("stock")}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="card space-y-4 p-6" disabled={submitting}>
          <legend className="sr-only">Media and status</legend>
          <h2 className="text-lg font-semibold">Media &amp; status</h2>
          <Field id="imageUrl" label="Image URL" error={errors.imageUrl} hint="Optional. Must start with http:// or https://">
            <input
              id="imageUrl"
              type="url"
              className="input"
              value={values.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://example.com/product.jpg"
              aria-invalid={!!errors.imageUrl}
              aria-describedby={describedBy("imageUrl")}
            />
          </Field>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={values.draft}
              onChange={(e) => update("draft", e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Save as draft (not visible on the storefront)
          </label>
        </fieldset>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" className="btn btn-primary flex-1 py-3" disabled={submitting}>
            {submitting ? "Creating product…" : "Create product"}
          </button>
          <button
            type="button"
            className="btn btn-secondary py-3"
            disabled={submitting}
            onClick={() => {
              setValues(EMPTY);
              setErrors({});
              setStatus({ type: "idle" });
            }}
          >
            Reset
          </button>
          <Link href="/" className="btn btn-secondary py-3">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
