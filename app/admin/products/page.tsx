import ProductList from '@/app/components/ProductList';

export default function AdminProductsPage() {
  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Products Management</h1>
      <ProductList />
    </div>
  );
}