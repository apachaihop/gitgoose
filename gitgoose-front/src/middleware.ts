import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token');
    
    if (!token && !request.nextUrl.pathname.startsWith('/signin')) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/repositories/:path*',
        '/settings/:path*',
    ],
};