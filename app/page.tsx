import { PrismaClient } from '@prisma/client';
import ProductCard from './components/ProductCard';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Discover Products</h1>
          <p className="text-gray-500 mt-2">Find the best items and add them to your cart.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-blue-600 hover:underline font-medium px-4 py-2 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors">
            ⚙️ Admin Panel
          </Link>
          <Link 
            href="/cart" 
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span>🛒</span>
            <span>Go to Cart</span>
          </Link>
        </div>
      </header>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-5xl">🛍️</span>
          <h3 className="text-2xl font-bold mt-4 text-gray-800">No products yet</h3>
          <p className="text-gray-500 mt-2">Check back later or add some from the Admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: { id: string; title: string; description: string; price: number; imageUrl: string | null; stripePriceId: string | null }) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}