import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/register'];
const authRoutes = ['/login', '/register'];
const excludedPaths = ['/auth/google/redirect', '/api', '/_next', '/favicon.ico'];

export function middleware(request: NextRequest) {
  // Check if the path should be excluded from middleware
  const isExcludedPath = excludedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  if (isExcludedPath) {
    return; // Skip middleware for excluded paths
  }

  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  console.log('Middleware - pathname:', pathname);
  console.log('Middleware - token:', token);

  // If trying to access auth routes while logged in, redirect to repositories
  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/repositories', request.url));
  }

  // If trying to access protected routes without token, redirect to login
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Don't use NextResponse.next(), just return undefined to continue
  return;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and API routes
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};