import { auth0 } from "@/lib/auth0";
import { getStorefrontProducts } from "@/lib/store";
import ProductImage from "./components/ProductImage";

// Always render on request so products added via the admin API show up immediately.
export const dynamic = "force-dynamic";

export default async function Home() {
  // Public page: the session is only read to personalize the hero, never to block access.
  const session = await auth0.getSession();
  const user = session?.user;
  const products = getStorefrontProducts();

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {user ? `Welcome back, ${user.given_name ?? user.name ?? "shopper"}!` : "Welcome to MiniCommerce"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Discover handpicked products. Browsing is open to everyone — create an account to manage your profile and
            shipping address.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#products" className="btn btn-secondary">
              Browse products
            </a>
            {user ? (
              <a href="/profile" className="btn btn-primary">
                Go to my profile
              </a>
            ) : (
              <a href="/auth/login?screen_hint=signup" className="btn btn-primary">
                Create a free account
              </a>
            )}
          </div>
        </div>
      </section>

      <section id="products" className="scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Featured products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="card group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-48 overflow-hidden bg-surface-muted">
                  <ProductImage src={product.imageUrl} alt={product.title} />
                  <span className="absolute left-3 top-3 rounded-md bg-surface/90 px-2 py-1 text-xs font-semibold uppercase tracking-tight text-muted">
                    {product.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold leading-tight">{product.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{product.description}</p>
                  <p className="mt-4 text-xl font-bold text-primary">
                    {product.price.amount.toLocaleString("en-US", {
                      style: "currency",
                      currency: product.price.currency,
                    })}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
