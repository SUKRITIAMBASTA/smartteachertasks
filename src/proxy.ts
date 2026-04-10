import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * 🛡️ Institutional Proxy (formerly Middleware)
 * Next.js 16.2.2 Convention: Renamed to 'proxy'
 */
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // 1. Unrestricted Routes
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth') || pathname.startsWith('/api/debug/seed')) {
    if (token && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Automated Redirects
  if (pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL('/contact', request.url));
  }

  // 3. Global Authentication Gate
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Institutional RBAC Gate
  if (pathname.startsWith('/users') && (token as any).role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Named export for the Proxy convention
export default proxy;

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/tickets/:path*', 
    '/announcements/:path*', 
    '/resources/:path*', 
    '/users/:path*', 
    '/profile/:path*', 
    '/login',
    '/schedule-manager/:path*'
  ],
};
