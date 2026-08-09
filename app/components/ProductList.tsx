'use client';
import { useEffect, useState } from 'react';

export default function ProductList() {
  const [products, setProducts] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products)) setProducts(data.products);
      })
      .catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts(products.filter((p) => p.id !== id));
      alert('Product deleted successfully');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Products</h2>
      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li key={product.id} className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-800 font-medium">{product.title}</span>
              <div className="space-x-2 flex">
                <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">
                  Update
                </button>
                <button 
                  onClick={() => handleDelete(product.id)} 
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}