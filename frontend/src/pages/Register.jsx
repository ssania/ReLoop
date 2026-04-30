// ── Register page ─────────────────────────────────────────────────────────────
// Route: /register
// Hooks into AuthContext.register() which calls POST /api/auth/register.
// On success → shows a "check your inbox" message (email verification required).
// Validates @umass.edu on every keystroke for instant feedback.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  // Show @umass.edu warning as soon as they start typing an email.
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

    // Client-side checks before hitting the server.
    if (!email.toLowerCase().endsWith('@umass.edu')) {
      setError('Only @umass.edu email addresses are allowed.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const msg = await register(name, email, password);
      // Don't auto-login — user must verify their @umass.edu email first.
      setSuccess(msg || 'Account created! Check your @umass.edu inbox to verify your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(72px,10vw,80px) 16px 40px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo / wordmark */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2 mb-3">
            <svg width="28" height="28" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1.5L13 4.5V10.5L7.5 13.5L2 10.5V4.5Z" stroke="#c96a2e" strokeWidth="1.3" fill="none" />
              <circle cx="7.5" cy="7.5" r="2.2" fill="#c96a2e" />
            </svg>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '20px', letterSpacing: '-.5px' }}>ReLoop</span>
          </div>
          <h5 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, letterSpacing: '-.5px', marginBottom: '6px' }}>Create your account</h5>
          <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)' }}>UMass Amherst students only</p>
        </div>

        {/* Card */}
        <div className="card border rounded-4 p-4" style={{ background: '#fff' }}>

          {/* Success state — replaces the form after account creation */}
          {success ? (
            <div className="text-center py-2">
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📬</div>
              <div className="fw-bold mb-2" style={{ fontFamily: 'Syne,sans-serif', fontSize: '15px' }}>Check your inbox</div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 300, marginBottom: '16px' }}>{success}</p>
              <Link to="/login" className="btn btn-dark rounded-3 px-4 py-2" style={{ fontSize: '13px' }}>Go to login</Link>
            </div>
          ) : (
            <>
              {/* Error banner */}
              {error && (
                <div className="rounded-3 px-3 py-2 mb-3 d-flex align-items-center gap-2"
                  style={{ background: '#fff3f0', border: '1px solid #f5c6c0', fontSize: '13px', color: '#b94038' }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>
                    Full name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sania Khan"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                {/* Email */}
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
                  {/* Inline hint shown before an error fires */}
                  {!error && (
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Must end with @umass.edu</div>
                  )}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {/* Confirm password */}
                <div className="mb-4">
                  <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>
                    Confirm password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-dark w-100 rounded-3 py-3"
                  style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '14px' }}
                  disabled={loading}
                >
                  {loading ? 'Creating account…' : '→ Create account'}
                </button>
              </form>

              <hr style={{ borderColor: 'var(--sand3)', margin: '20px 0' }} />

              <p className="text-center mb-0" style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--terra)', fontWeight: 500, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center mt-3 mb-0" style={{ fontSize: '11px', fontWeight: 300, color: 'var(--muted)' }}>
          🔒 ReLoop is exclusively for verified UMass Amherst students
        </p>
      </div>
    </div>
  );
}
