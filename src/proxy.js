import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Route protection proxy (Next.js 16 convention, replaces middleware.js).
 * Runs in Node.js runtime so it can safely import auth.js (with Prisma/bcrypt).
 * Redirects unauthenticated users to /auth/login for protected routes.
 */
export async function proxy(request) {
  const session = await auth();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/auth');
  const isApiRoute = pathname.startsWith('/api');

  // Don't gate auth pages or API routes
  if (isAuthPage || isApiRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!session?.user) {
    const loginUrl = new URL('/auth/login', request.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
