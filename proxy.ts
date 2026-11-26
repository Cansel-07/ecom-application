import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

// Only these areas require a session. Everything else (home page, product
// browsing, /auth/* routes) stays public so guests can use the store.
const PROTECTED_PAGES = ["/profile", "/admin"];
const PROTECTED_APIS = ["/api/profile", "/api/admin"];

const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export default async function proxy(request: NextRequest) {
  // Always let the Auth0 SDK handle /auth/* routes and keep the session cookie rolling.
  const authResponse = await auth0.middleware(request);

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/auth")) return authResponse;

  const isProtectedPage = matches(pathname, PROTECTED_PAGES);
  const isProtectedApi = matches(pathname, PROTECTED_APIS);
  if (!isProtectedPage && !isProtectedApi) return authResponse;

  const session = await auth0.getSession(request);
  if (session) return authResponse;

  if (isProtectedApi) {
    return NextResponse.json(
      { success: false, message: "You must be logged in to perform this action." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/auth/login", request.nextUrl.origin);
  loginUrl.searchParams.set("returnTo", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
