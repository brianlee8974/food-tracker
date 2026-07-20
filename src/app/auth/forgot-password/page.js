'use client';

import { useState } from 'react';
import Link from 'next/link';
import '../auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setEmail('');
      setIsLoading(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Reset Password</h1>
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#efe',
                border: '1px solid #cfc',
                borderRadius: '6px',
                color: '#3c3',
                marginBottom: '1.5rem',
              }}
            >
              Check your email for password reset instructions
            </div>
            <Link href="/auth/login" style={{ color: '#667eea', textDecoration: 'none' }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={isLoading} className="submit-button">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-link">
              <Link href="/auth/login">Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
