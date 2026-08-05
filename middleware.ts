import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';

export default withMiddlewareAuthRequired(async function middleware(req) {
  const res = NextResponse.next();
  const session = await getSession(req, res);

  if (req.nextUrl.pathname.startsWith('/admin')) {
    const roles = session?.user?.['https://ecom/roles'] || [];
    
    if (!roles.includes('Admin')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  return res;
});

export const config = {
  matcher: ['/profile', '/admin/:path*'],
};