import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import ProductForm from "./ProductForm";

export const metadata: Metadata = { title: "Create New Product (Admin)" };

export default async function NewProductPage() {
  // Login is required; the Admin *role* check will be added in the next lesson.
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login?returnTo=/admin/products/new");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight">Create New Product</h1>
        <p className="mt-1 text-muted">
          Fill in the product details below. Fields marked with <span className="text-danger">*</span> are required.
        </p>
      </header>
      <ProductForm />
    </div>
  );
}
