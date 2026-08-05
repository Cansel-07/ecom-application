"use client";
import React from "react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Home() {
  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-500">Error: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-900">
        Welcome to Ecom Application
      </h1>

      <div className="flex flex-col items-center gap-6 bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center">
        {!user ? (
          <React.Fragment>
            <p className="text-gray-600 mb-4">Please log in or sign up to continue shopping.</p>
            <a 
              href="/auth/login" 
              className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors block"
            >
              Log In / Sign Up
            </a>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <p className="text-lg text-gray-800">Hello, <span className="font-bold">{user.email}</span>!</p>
            <div className="flex flex-col w-full gap-3 mt-4">
              <Link 
                href="/profile" 
                className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors block"
              >
                Go to My Profile
              </Link>
              <a 
                href="/auth/logout" 
                className="w-full px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors block"
              >
                Log Out
              </a>
            </div>
          </React.Fragment>
        )}
      </div>
    </main>
  );
}