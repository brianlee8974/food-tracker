'use client';

import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-group">
          <h1>placeholder</h1>
        </div>
        <p className="tagline">Your kitchen, organized.</p>
      </div>
      {session?.user && (
        <div className="header-user">
          <span className="user-email">{session.user.email}</span>
          <button
            className="btn-signout"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
