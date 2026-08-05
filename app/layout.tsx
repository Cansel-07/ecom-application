import type { Metadata } from "next";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecom Application",
  description: "E-commerce application for Lesson 38",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Auth0Provider>
        <body className="antialiased bg-gray-50 text-gray-900 min-h-screen">
          {children}
        </body>
      </Auth0Provider>
    </html>
  );
}