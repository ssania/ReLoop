// ── Login page ────────────────────────────────────────────────────────────────
// Route: /login
// Shows a success banner when redirected from email verification (?verified=true)
// Shows a clear message if the user tries to login before verifying their email.

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const from = location.state?.from?.pathname || '/profile';

  // Show "Email verified!" banner if redirected from the verify link.
  const justVerified = new URLSearchParams(location.search).get('verified') === 'true';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  function validateEmail(val) {
    if (val && !val.toLowerCase().endsWith('@umass.edu')) {
      setError('Only @umass.edu email addresses are allowed.');
    } else {
      setError('');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.toLowerCase().endsWith('@umass.edu')) {
      setError('Only @umass.edu email addresses are allowed.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 40px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2 mb-3">
            <svg width="28" height="28" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1.5L13 4.5V10.5L7.5 13.5L2 10.5V4.5Z" stroke="#c96a2e" strokeWidth="1.3" fill="none" />
              <circle cx="7.5" cy="7.5" r="2.2" fill="#c96a2e" />
            </svg>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '20px', letterSpacing: '-.5px' }}>ReLoop</span>
          </div>
          <h5 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, letterSpacing: '-.5px', marginBottom: '6px' }}>Welcome back</h5>
          <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)' }}>Sign in with your @umass.edu account</p>
        </div>

        <div className="card border rounded-4 p-4" style={{ background: '#fff' }}>

          {/* ✅ Verified success banner */}
          {justVerified && (
            <div className="rounded-3 px-3 py-2 mb-3 d-flex align-items-center gap-2"
              style={{ background: '#f0faf0', border: '1px solid #b6e0b6', fontSize: '13px', color: '#2e7d32' }}>
              ✅ Email verified! You can now log in.
            </div>
          )}

          {/* ⚠️ Error banner */}
          {error && (
            <div className="rounded-3 px-3 py-2 mb-3 d-flex align-items-center gap-2"
              style={{ background: '#fff3f0', border: '1px solid #f5c6c0', fontSize: '13px', color: '#b94038' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>
                UMass Email
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="yourname@umass.edu"
                value={email}
                onChange={e => { setEmail(e.target.value); validateEmail(e.target.value); }}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>
                Password
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 rounded-3 py-3"
              style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '14px' }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : '→ Sign in'}
            </button>
          </form>

          <hr style={{ borderColor: 'var(--sand3)', margin: '20px 0' }} />

          <p className="text-center mb-0" style={{ fontSize: '13px', color: 'var(--muted)' }}>
            No account yet?{' '}
            <Link to="/register" style={{ color: 'var(--terra)', fontWeight: 500, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center mt-3 mb-0" style={{ fontSize: '11px', fontWeight: 300, color: 'var(--muted)' }}>
          🔒 ReLoop is exclusively for verified UMass Amherst students
        </p>
      </div>
    </div>
  );
}