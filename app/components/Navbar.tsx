"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

type NavItem = { href: string; label: string };

const PUBLIC_LINKS: NavItem[] = [{ href: "/", label: "Home" }];
const USER_LINKS: NavItem[] = [
  { href: "/profile", label: "Profile" },
  { href: "/admin/products/new", label: "Create Product (Admin)" },
];

export default function Navbar() {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // Close the mobile menu whenever the route changes (state-during-render pattern).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  const links = user ? [...PUBLIC_LINKS, ...USER_LINKS] : PUBLIC_LINKS;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const linkClass = (href: string) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-primary-soft text-primary"
        : "text-muted hover:bg-surface-muted hover:text-foreground"
    }`;

  // Auth routes are API routes handled by the Auth0 SDK, so they must be plain
  // <a> tags (full navigation), never next/link.
  const authButtons = isLoading ? (
    <span className="h-9 w-32 animate-pulse rounded-md bg-surface-muted" aria-hidden="true" />
  ) : user ? (
    <a href="/auth/logout" className="btn btn-danger">
      Logout
    </a>
  ) : (
    <>
      <a href="/auth/login" className="btn btn-ghost">
        Login
      </a>
      <a href="/auth/login?screen_hint=signup" className="btn btn-primary">
        Sign Up
      </a>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-primary">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </span>
              MiniCommerce
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className={linkClass(l.href)} aria-current={isActive(l.href) ? "page" : undefined}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user && (
              <Link href="/profile" className="flex items-center gap-2" aria-label="Open profile">
                <Avatar name={user.name ?? user.email} picture={user.picture} />
                <span className="max-w-32 truncate text-sm font-medium">{user.name ?? user.email}</span>
              </Link>
            )}
            {authButtons}
          </div>

          <button
            type="button"
            className="btn btn-ghost px-2 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {menuOpen ? <path d="M6 18 18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-menu" className="border-t border-line py-3 md:hidden">
            {user && (
              <div className="mb-3 flex items-center gap-3 px-3">
                <Avatar name={user.name ?? user.email} picture={user.picture} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className={linkClass(l.href)} aria-current={isActive(l.href) ? "page" : undefined}>
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex gap-2 border-t border-line px-3 pt-3">{authButtons}</div>
          </div>
        )}
      </nav>
    </header>
  );
}

export function Avatar({ name, picture, size = 32 }: { name?: string | null; picture?: string | null; size?: number }) {
  const style = { width: size, height: size };
  return picture ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={picture} alt="" style={style} className="rounded-full border border-line object-cover" referrerPolicy="no-referrer" />
  ) : (
    <span style={style} className="inline-flex items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
      {(name ?? "?").charAt(0).toUpperCase()}
    </span>
  );
}
