'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * Client-side providers wrapper.
 * Wraps children in NextAuth's SessionProvider so useSession()
 * works throughout the component tree.
 */
export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
