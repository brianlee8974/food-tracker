import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Verify the request is authenticated and return the userId.
 * Returns { userId: string } on success, or a NextResponse 401 on failure.
 *
 * Usage in route handlers:
 *   const authResult = await requireAuth();
 *   if (authResult instanceof NextResponse) return authResult;
 *   const { userId } = authResult;
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return { userId: session.user.id };
}
