// ── Navbar component ──────────────────────────────────────────────────────────
// Same as original, with two auth-aware additions:
//   1. Shows "Login" link when logged out, "Logout" button when logged in
//   2. Hides "Profile" link when logged out (nothing to show there)
//
// Changes from original are marked with // ← AUTH

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ← AUTH

const NAV_ITEMS = [
  ['/', 'Home'],
  ['/housing', 'Housing Hub'],
  ['/marketplace', 'Marketplace'],
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ← AUTH

  // ← AUTH: logout and redirect home
  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate('/');
  }

  return (
    <>
      <nav className="navbar fixed-top border-bottom px-3 px-lg-5">
        {/* Logo */}
        <NavLink to="/" className="logo d-flex align-items-center gap-2">
          <div className="logo-gem">
            <svg viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1.5L13 4.5V10.5L7.5 13.5L2 10.5V4.5Z" stroke="#c96a2e" strokeWidth="1.3" fill="none" />
              <circle cx="7.5" cy="7.5" r="2.2" fill="#c96a2e" />
            </svg>
          </div>
          ReLoop
        </NavLink>

        {/* Desktop links */}
        <div className="d-none d-lg-flex align-items-center gap-1 ms-auto me-2">
          {NAV_ITEMS.map(([path, label]) => (
            <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nl${isActive ? ' active' : ''}`}>
              {label}
            </NavLink>
          ))}

          {/* ← AUTH: show Profile only when logged in */}
          {user && (
            <NavLink to="/profile" className={({ isActive }) => `nl${isActive ? ' active' : ''}`}>
              Profile
            </NavLink>
          )}

          {/* ← AUTH: Login or Logout */}
          {!user ? (
            <NavLink to="/login" className={({ isActive }) => `nl${isActive ? ' active' : ''}`}>
              Login
            </NavLink>
          ) : (
            <button
              className="nl bg-transparent border-0"
              style={{ cursor: 'pointer' }}
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>

        {/* Desktop CTA — only when logged in */}
        {user && (
          <button
            className="btn btn-dark rounded-3 d-none d-lg-block"
            style={{ fontSize: '13px', padding: '9px 20px' }}
            onClick={() => navigate('/profile')}
          >
            + List Item
          </button>
        )}

        {/* Mobile hamburger */}
        <button className="d-lg-none ms-auto bg-transparent border-0 p-2" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 6h16M3 11h16M3 16h16" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        {NAV_ITEMS.map(([path, label]) => (
          <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `mobile-nl${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
            {label}
          </NavLink>
        ))}

        {/* ← AUTH: Profile link in mobile menu */}
        {user && (
          <NavLink to="/profile" className={({ isActive }) => `mobile-nl${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
            Profile
          </NavLink>
        )}

        {/* ← AUTH: Login / Logout in mobile menu */}
        {!user ? (
          <NavLink to="/login" className={({ isActive }) => `mobile-nl${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
            Login
          </NavLink>
        ) : (
          <button className="mobile-nl bg-transparent border-0 text-start w-100" style={{ cursor: 'pointer' }} onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </>
  );
}