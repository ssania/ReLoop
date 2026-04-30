// ── Verify Email page ─────────────────────────────────────────────────────────
// Route: /verify-email?token=xxxx
// The link in the verification email points here.
// This page just reads the token from the URL and calls GET /api/auth/verify/:token
// The backend then redirects to /login?verified=true on success.

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams]  = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'error'

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    // Hit the backend verify endpoint — it redirects to /login?verified=true on success.
    // If it fails (bad token), we show an error here.
    fetch(`http://localhost:5002/api/auth/verify/${token}`)
      .then(res => {
        if (!res.ok) setStatus('error');
        // On success the backend does a redirect, so the browser will navigate away.
      })
      .catch(() => setStatus('error'));
  }, [searchParams]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 40px' }}>
      <div className="text-center" style={{ maxWidth: '400px' }}>

        {status === 'verifying' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
            <h5 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800 }}>Verifying your email…</h5>
            <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 300 }}>Just a second.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
            <h5 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800 }}>Invalid or expired link</h5>
            <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 300, marginBottom: '20px' }}>
              This verification link is invalid or has already been used. Please register again.
            </p>
            <Link to="/register" className="btn btn-dark rounded-3 px-4 py-2" style={{ fontSize: '13px' }}>
              Back to register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}