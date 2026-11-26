import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MiniCommerce", template: "%s · MiniCommerce" },
  description: "E-commerce application built with Next.js and Auth0 (Lesson 38).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} MiniCommerce</p>
            <p>Built with Next.js &amp; Auth0</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
