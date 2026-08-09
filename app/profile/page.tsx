'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';

interface OrderItem {
  id: string;
  quantity: number;
}

interface Order {
  id: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let isMounted = true;

    if (user?.sub) {
      fetch(`/api/orders?userId=${encodeURIComponent(user.sub)}`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && Array.isArray(data)) {
            setOrders(data);
          }
        })
        .catch((err) => console.error('Failed to load orders:', err));
    }

    return () => {
      isMounted = false;
    };
  }, [user?.sub]);

  if (isLoading) {
    return <div className="p-10 text-center text-gray-800 font-medium">Loading profile...</div>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto min-h-screen">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600 mt-1">Email: <span className="font-semibold text-gray-800">{user?.email}</span></p>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-gray-900">Order History</h2>

      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-gray-500">
          No previous orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <p className="font-bold text-gray-800">Order ID: <span className="font-mono text-sm text-gray-600">{order.id}</span></p>
                <p className="text-sm text-gray-500 mt-1">
                  Date: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold uppercase px-2.5 py-1 bg-green-100 text-green-800 rounded-full">
                  Completed
                </span>
                <p className="text-green-600 font-extrabold text-xl mt-1">
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}