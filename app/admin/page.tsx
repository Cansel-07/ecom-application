import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const session = await getSession();
  
  const roles = session?.user?.['https://ecom/roles'] || [];

  if (!roles.includes('Admin')) {
    redirect('/');
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      <p className="mt-4 text-gray-600">
        Welcome, Admin! Only authorized users can see this page. We will add the product creation form here soon.
      </p>
    </div>
  );
}