'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="p-10 max-w-xl mx-auto text-center mt-20 bg-white rounded-2xl shadow-sm border border-gray-200">
      <span className="text-6xl">🎉</span>
      <h1 className="text-3xl font-extrabold text-gray-900 mt-4 mb-2">Payment Successful!</h1>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. Your order has been processed via Stripe.
      </p>
      <Link
        href="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full inline-block transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}