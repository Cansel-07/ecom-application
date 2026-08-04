"use client";
import React from "react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Profile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-semibold">Loading profile...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-semibold text-red-500">Error: {error.message}</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md text-center">
          <p className="text-gray-600 mb-4">You need to be logged in to view your profile.</p>
          <a href="/auth/login" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 block">
            Log In
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-screen p-8 bg-gray-50">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl mt-10">
        <h1 className="text-3xl font-bold mb-6 border-b pb-4 text-blue-900">User Profile</h1>
        
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            {user.picture && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={user.picture} 
                alt={user.name || "Profile Picture"} 
                className="w-20 h-20 rounded-full shadow-md border-2 border-gray-200"
              />
            )}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="font-bold text-gray-700 block mb-1">Email Address</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
            
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="font-bold text-gray-700 block mb-1">Nickname</span>
              <span className="text-gray-900">{user.nickname || "Not provided"}</span>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="font-bold text-gray-700 block mb-1">Shipping Address</span>
              <span className="text-gray-900 italic text-sm">No address added yet. (Settings coming soon)</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex justify-between items-center">
            <Link href="/" className="text-blue-600 hover:underline font-semibold">
              &larr; Back to Home
            </Link>
            <a href="/auth/logout" className="text-red-500 hover:underline font-semibold">
              Log Out
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}