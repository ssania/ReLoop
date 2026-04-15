// ── Navbar component ──────────────────────────────────────────────────────────
// Fixed top navigation bar rendered on every page (mounted in App.jsx).
// Two layouts share one component:
//   • Desktop (lg+): horizontal nav links + "List Item" CTA button (d-none d-lg-flex)
//   • Mobile (<lg):  hamburger icon → full-width dropdown menu (d-lg-none)
//
// React Router's <NavLink> adds an 'active' class automatically when the link's
// route matches the current URL, which our .nl.active CSS rule highlights.

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

// NAV_ITEMS: [path, label] pairs that drive both the desktop links and the
// mobile dropdown. Updating this array changes both menus at once.
const NAV_ITEMS = [
  ['/', 'Home'],
  ['/housing', 'Housing Hub'],
  ['/marketplace', 'Marketplace'],
  ['/profile', 'Profile'],
];

export default function Navbar() {
  // mobileOpen: controls whether the mobile dropdown is visible.
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="navbar fixed-top border-bottom px-3 px-lg-5">
        {/* Logo – navigates home on click; NavLink applies 'active' class on '/'. */}
        <NavLink to="/" className="logo d-flex align-items-center gap-2">
          <div className="logo-gem">
            {/* Hexagon-with-circle SVG mark */}
            <svg viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1.5L13 4.5V10.5L7.5 13.5L2 10.5V4.5Z" stroke="#c96a2e" strokeWidth="1.3" fill="none" />
              <circle cx="7.5" cy="7.5" r="2.2" fill="#c96a2e" />
            </svg>
          </div>
          ReLoop
        </NavLink>

        {/* Desktop links – hidden on mobile via d-none d-lg-flex. */}
        <div className="d-none d-lg-flex align-items-center gap-1 ms-auto me-2">
          {NAV_ITEMS.map(([path, label]) => (
            // end={path === '/'} prevents '/' from matching every route as active.
            <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nl${isActive ? ' active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Desktop CTA – takes the user to their Profile to create a listing. */}
        <button className="btn btn-dark rounded-3 d-none d-lg-block" style={{ fontSize: '13px', padding: '9px 20px' }} onClick={() => navigate('/profile')}>
          + List Item
        </button>

        {/* Mobile hamburger – toggles mobileOpen state. */}
        <button className="d-lg-none ms-auto bg-transparent border-0 p-2" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 6h16M3 11h16M3 16h16" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown – positioned directly below the navbar (top: var(--nav-h)).
          .open class switches display:none → display:flex via index.css.
          Clicking a link closes the menu by resetting mobileOpen to false.       */}
      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        {NAV_ITEMS.map(([path, label]) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `mobile-nl${isActive ? ' active' : ''}`}
            onClick={() => setMobileOpen(false)} // close menu on navigation
          >
            {label}
          </NavLink>
        ))}
      </div>
    </>
  );
}
