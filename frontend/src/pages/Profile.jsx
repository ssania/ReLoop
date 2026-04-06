// ── Profile page ──────────────────────────────────────────────────────────────
// Logged-in user's dashboard at "/profile".
// Currently displays a hardcoded user (Alex Johnson) – auth integration is
// pending. When the backend is ready, user info will come from an auth context.
//
// Three tabs:
//   listings – first 4 items from AppContext.listings (simulates "my listings")
//   saved    – items whose IDs are in AppContext.savedIds
//   reviews  – static review data from mockData.myReviews
//
// Stats grid: 4 summary numbers at the top of the page.
// DetailModal opens locally when a listing card is clicked.

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { myReviews } from '../data/mockData';
import CardA from '../components/CardA';
import DetailModal from '../components/DetailModal';

// TABS: [key, label] pairs for the tab bar.
const TABS = [['listings', 'My listings'], ['saved', 'Saved items'], ['reviews', 'Reviews']];

export default function Profile() {
  const { listings, savedIds } = useApp();
  const [tab, setTab] = useState('listings');

  // selectedItem: null when no detail modal is open.
  const [selectedItem, setSelectedItem] = useState(null);

  // savedItems: derived from listings filtered by savedIds.
  // Re-derived on every render so it reflects the latest savedIds Set.
  const savedItems = listings.filter(m => savedIds.has(m.id));

  // statCards: [value, label] pairs shown in the 2×4 summary grid.
  const statCards = [
    ['4', 'Active listings'],
    ['11', 'Items sold'],
    [savedIds.size, 'Saved items'], // live count from context
    ['4.8 ⭐', 'Seller rating'],
  ];

  return (
    <>
      {/* ── PROFILE HERO ─────────────────────────────────────────────────── */}
      <div className="bg-white border-bottom" style={{ padding: 'clamp(24px,4vw,40px) clamp(16px,4vw,40px)' }}>
        <div className="d-flex align-items-center flex-wrap gap-4" style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {/* Large initials avatar. */}
          <div className="profile-avatar">AJ</div>
          <div>
            {/* Hardcoded user name and email until auth is wired up. */}
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800, letterSpacing: '-.5px' }}>Alex Johnson</div>
            <div style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)', marginTop: '3px' }}>ajohnson@umass.edu</div>
            {/* Verified badge – confirms the @umass.edu email. */}
            <div className="verified-badge">✓ Verified UMass Student</div>
          </div>
        </div>
      </div>

      {/* ── PROFILE TABS ─────────────────────────────────────────────────── */}
      <div className="bg-white border-bottom px-4">
        <div className="d-flex overflow-x-auto" style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {TABS.map(([key, label]) => (
            // .ptab.on applies the active underline style (defined in index.css).
            <button key={key} className={`ptab${tab === key ? ' on' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="py-4 px-4" style={{ maxWidth: '1160px', margin: '0 auto' }}>

        {/* Stats grid – 2 columns on mobile, 4 on md+. */}
        <div className="row row-cols-2 row-cols-md-4 g-3 mb-4">
          {statCards.map(([n, l]) => (
            <div key={l} className="col">
              <div className="card border text-center p-3" style={{ borderRadius: '12px' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '24px', fontWeight: 800, letterSpacing: '-.8px' }}>{n}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* My listings tab – shows the first 4 listings as a preview.
            In the real app this will be filtered by the logged-in user's ID.    */}
        {tab === 'listings' && (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
            {listings.slice(0, 4).map(item => (
              <div key={item.id} className="col">
                <CardA item={item} onClick={setSelectedItem} />
              </div>
            ))}
          </div>
        )}

        {/* Saved items tab – derived from savedIds; shows empty state if none saved. */}
        {tab === 'saved' && (
          savedItems.length ? (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
              {savedItems.map(item => (
                <div key={item.id} className="col">
                  <CardA item={item} onClick={setSelectedItem} />
                </div>
              ))}
            </div>
          ) : (
            // Empty state – shown until the user saves at least one item.
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏷️</div>
              <div className="fw-bold mb-2" style={{ fontFamily: 'Syne,sans-serif', fontSize: '16px' }}>No saved items yet</div>
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)' }}>Browse the marketplace and tap ♡ to save listings for later.</p>
            </div>
          )
        )}

        {/* Reviews tab – renders myReviews from mock data.
            Each review shows: reviewer avatar + name + date + star repeat + text. */}
        {tab === 'reviews' && (
          <div className="d-flex flex-column gap-3">
            {myReviews.map((r, i) => (
              <div key={i} className="card border p-4" style={{ borderRadius: '14px' }}>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="card-avatar" style={{ width: '36px', height: '36px', fontSize: '12px' }}>{r.init}</div>
                  <div className="flex-grow-1">
                    <div className="fw-medium" style={{ fontSize: '13px' }}>{r.from}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{r.date}</div>
                  </div>
                  {/* Star rating – repeat emoji r.stars times. */}
                  <div style={{ fontSize: '12px' }}>{'⭐'.repeat(r.stars)}</div>
                </div>
                <p className="mb-0" style={{ fontSize: '13px', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.7 }}>{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DetailModal mounts only when a listing card has been clicked. */}
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </>
  );
}
