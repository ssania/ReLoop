// ── Verify Email page ─────────────────────────────────────────────────────────
// Route: /verify-email?token=xxxx
// The link in the verification email points here.
// This page just reads the token from the URL and calls GET /api/auth/verify/:token
// The backend then redirects to /login?verified=true on success.

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams]  = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'error'

  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    // Navigate the browser directly to the backend verify URL.
    // The backend marks verified=true then redirects to /login?verified=true.
    // Using window.location lets the browser follow the redirect natively.
    fetch(`http://localhost:5002/api/auth/verify/${token}`, { redirect: 'manual' })
      .then(res => {
        console.log('Verify response status:', res.status, 'type:', res.type, 'redirected:', res.redirected);
        // status 0 = opaqueredirect (backend sent a redirect) = success
        // status 200 = followed redirect = success
        // anything else = error
        if (res.type === 'opaqueredirect' || res.ok || res.redirected) {
          window.location.href = 'http://localhost:5173/login?verified=true';
        } else {
          setStatus('error');
        }
      })
      .catch(err => { console.error('Verify fetch error:', err); setStatus('error'); });
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