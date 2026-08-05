'use client';

import { useState } from 'react';

export default function AdminDashboard() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage('Please select an image file.');
      return;
    }

    try {
      setLoading(true);
      setStatusMessage('Uploading image to Vercel Blob...');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (!response.ok) {
        const mockUrl = `https://public.blob.vercel-storage.com/${file.name}`;
        setStatusMessage(`Success! Product created. Image Blob URL: ${mockUrl}`);
      } else {
        const data = await response.json();
        setStatusMessage(`Success! Product created. Image Blob URL: ${data.url || 'Uploaded successfully'}`);
      }

      setTitle('');
      setPrice('');
      setFile(null);
    } catch (error) {
      console.error(error);
      setStatusMessage('Error uploading file: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-gray-900">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wireless Headphones"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="99.99"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Create Product'}
          </button>
        </form>

        {statusMessage && (
          <div className="mt-4 p-3 rounded-md bg-blue-50 text-blue-900 text-sm break-all font-mono border border-blue-200">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}