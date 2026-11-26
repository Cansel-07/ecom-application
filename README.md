# MiniCommerce — Next.js E-Commerce Application

A full-stack e-commerce web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Auth0 v4**. Guests can browse the product catalog freely, while authenticated users can manage their profile settings and create new products through the admin dashboard.

🚀 **Live Demo:** [https://ecom-application.vercel.app](https://ecom-application.vercel.app)

---

## 📸 Preview

> *Tip: Replace these placeholders with screenshots of your Home Page and Create Product Page.*

| Storefront (Home Page) | Admin — Create New Product |
| :---: | :---: |
| ![Storefront Preview](public/screenshots/storefront.png) | ![Create Product Preview](public/screenshots/admin-create-product.png) |

---

## ✨ Features

- **Public Storefront (`/`):** Open to all visitors without requiring login, featuring a responsive product grid and automatic image fallback handling.
- **Authentication & Route Protection (Auth0 v4):** Seamless **Sign Up**, **Log In**, and **Log Out** flows integrated into the shared navigation bar, with server-side session checks protecting private routes.
- **User Profile (`/profile`):** Protected page displaying authenticated user account details and profile settings within the shared layout.
- **Admin — Create New Product (`/admin/products/new`):** Full product creation form (title, description, brand, SKU, price, currency, tax rate, category, stock, image URL, and draft/publish toggle) with both **client-side** and **server-side** validation and error handling.
- **Instant Catalog Sync:** Newly published products immediately appear on the storefront via Next.js cache revalidation (`revalidatePath`).
- **Shared Layout & Theming:** Consistent responsive Navbar, footer, and dark/light theme styling across all pages.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router) & React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Auth0 (`@auth0/nextjs-auth0` v4)
- **Deployment:** Vercel

---

## 📂 Project Structure

```text
ecom-application/
├── app/
│   ├── admin/products/new/   # Admin Create New Product page
│   ├── api/                  # API route handlers (products, profile)
│   ├── components/           # Shared UI components (Navbar, ProductImage, etc.)
│   ├── profile/              # Protected user profile page & view
│   ├── globals.css           # Global styles and theme variables
│   ├── layout.tsx            # Root layout with shared navigation
│   └── page.tsx              # Public storefront (featured products)
├── lib/
│   ├── auth0.ts              # Auth0 v4 client configuration
│   ├── products.ts           # Product validation & data helpers
│   ├── profile.ts            # User profile helpers
│   └── store.ts              # Shared in-memory product store
├── proxy.ts                  # Next.js auth middleware / route protection
└── package.json
