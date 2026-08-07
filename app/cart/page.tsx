'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function CartPage() {
  const { cartItems, removeFromCart, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          userId: user?.sub,
          userEmail: user?.email,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout failed: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong during checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="p-10 max-w-4xl mx-auto text-center mt-20">
        <span className="text-6xl">🛒</span>
        <h1 className="text-3xl font-bold mt-6 mb-4 text-gray-800">Your cart is empty</h1>
        <Link href="/" className="text-blue-600 hover:underline font-medium">
          ← Go back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-4xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Your Cart</h1>
        <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
          Continue Shopping
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-5 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-4">
              {item.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded-lg border border-gray-100" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">No Image</div>
              )}
              <div>
                <h2 className="font-bold text-lg text-gray-800">{item.title}</h2>
                <p className="text-gray-500">Qty: <span className="font-semibold text-gray-700">{item.quantity}</span></p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="font-bold text-xl text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 gap-4">
          <div className="text-xl text-gray-600">
            Total amount: <span className="text-3xl font-black text-gray-900 ml-2">${cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all hover:shadow-lg disabled:bg-gray-400 disabled:shadow-none flex items-center gap-2"
          >
            {loading ? 'Processing...' : (
              <>
                <span>Checkout with Stripe</span>
                <span>💳</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}