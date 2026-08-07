'use client';

import { useCart } from '../context/CartContext';

interface ProductProps {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stripePriceId: string | null;
}

export default function ProductCard({ product }: { product: ProductProps }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!product.stripePriceId) {
      alert("This product is not registered in Stripe and cannot be added to the cart.");
      return;
    }

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl || undefined,
      stripePriceId: product.stripePriceId,
    });

    alert(`${product.title} added to cart! 🛒`);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col">
      {product.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={product.imageUrl} alt={product.title} className="w-full h-48 object-cover rounded-lg mb-4" />
      ) : (
        <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
          No Image
        </div>
      )}
      <h2 className="text-xl font-bold text-gray-800 mb-2">{product.title}</h2>
      <p className="text-gray-500 text-sm mb-4 flex-grow line-clamp-3">{product.description}</p>
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
        <span className="text-2xl font-black text-blue-600">${product.price.toFixed(2)}</span>
        <button
          onClick={handleAddToCart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}