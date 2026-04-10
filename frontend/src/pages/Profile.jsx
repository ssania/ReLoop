// ── Profile page ──────────────────────────────────────────────────────────────
// Logged-in user's dashboard at "/profile".
// Hardcoded to "John Doe" until real auth is wired up.
//
// Three tabs:
//   listings – only listings where ownedByUser === true (created by this user)
//   saved    – listings whose IDs are in AppContext.savedIds
//   reviews  – fetched from GET /api/reviews on mount
//
// On the listings tab each card shows an "Edit" button that opens
// EditListingModal, letting the user change title, price, condition, status,
// and description in-place.

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import CardA from '../components/CardA';
import DetailModal from '../components/DetailModal';
import EditListingModal from '../components/EditListingModal';

const TABS = [['listings', 'My listings'], ['saved', 'Saved items'], ['reviews', 'Reviews']];

export default function Profile() {
  const { listings, savedIds } = useApp();
  const [tab, setTab] = useState('listings');
  const [myReviews, setMyReviews] = useState([]);

  // selectedItem: opens DetailModal when a card is clicked normally.
  const [selectedItem, setSelectedItem] = useState(null);

  // editItem: opens EditListingModal when the Edit button on an owned card is clicked.
  const [editItem, setEditItem] = useState(null);

  // Fetch this user's received reviews from the backend on mount.
  useEffect(() => {
    fetch('http://localhost:5000/api/reviews')
      .then(res => res.json())
      .then(data => setMyReviews(data))
      .catch(err => console.error('Failed to fetch reviews:', err));
  }, []);

  // myListings: only items the current user created (flagged in CreateListingModal).
  const myListings = listings.filter(m => m.ownedByUser);

  // savedItems: derived from the full listings array filtered by savedIds Set.
  const savedItems = listings.filter(m => savedIds.has(m.id));

  // Stats: active count is live from myListings; saved count is live from context.
  const statCards = [
    [myListings.length, 'Active listings'],
    [savedIds.size, 'Saved items'],
    ['4.8 ⭐', 'Seller rating'],
    ['Verified', 'Account status'],
  ];

  return (
    <>
      {/* ── PROFILE HERO ─────────────────────────────────────────────────── */}
      <div className="bg-white border-bottom" style={{ padding: 'clamp(24px,4vw,40px) clamp(16px,4vw,40px)' }}>
        <div className="d-flex align-items-center flex-wrap gap-4" style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div className="profile-avatar">JD</div>
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800, letterSpacing: '-.5px' }}>John Doe</div>
            <div style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)', marginTop: '3px' }}>johndoe@umass.edu</div>
            <div className="verified-badge">✓ Verified UMass Student</div>
          </div>
        </div>
      </div>

      {/* ── PROFILE TABS ─────────────────────────────────────────────────── */}
      <div className="bg-white border-bottom px-4">
        <div className="d-flex overflow-x-auto" style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {TABS.map(([key, label]) => (
            <button key={key} className={`ptab${tab === key ? ' on' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="py-4 px-4" style={{ maxWidth: '1160px', margin: '0 auto' }}>

        {/* Stats grid – live counts wherever possible. */}
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

        {/* ── My listings tab ───────────────────────────────────────────── */}
        {tab === 'listings' && (
          myListings.length ? (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
              {myListings.map(item => (
                <div key={item.id} className="col">
                  {/* Wrapper positions the Edit button over the card. */}
                  <div className="position-relative h-100">
                    <CardA item={item} onClick={setSelectedItem} />
                    {/* Edit button — stopPropagation so it doesn't also open DetailModal. */}
                    <button
                      className="btn btn-sm btn-dark position-absolute rounded-3"
                      style={{ bottom: '12px', right: '12px', fontSize: '11px', padding: '5px 12px', zIndex: 2 }}
                      onClick={e => { e.stopPropagation(); setEditItem(item); }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty state — shown until the user creates their first listing.
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
              <div className="fw-bold mb-2" style={{ fontFamily: 'Syne,sans-serif', fontSize: '16px' }}>No listings yet</div>
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)' }}>
                Go to the <strong>Marketplace</strong> and hit "Create listing" to post your first item.
              </p>
            </div>
          )
        )}

        {/* ── Saved items tab ───────────────────────────────────────────── */}
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
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏷️</div>
              <div className="fw-bold mb-2" style={{ fontFamily: 'Syne,sans-serif', fontSize: '16px' }}>No saved items yet</div>
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)' }}>Browse the marketplace and tap ♡ to save listings for later.</p>
            </div>
          )
        )}

        {/* ── Reviews tab ───────────────────────────────────────────────── */}
        {tab === 'reviews' && (
          myReviews.length ? (
            <div className="d-flex flex-column gap-3">
              {myReviews.map((r, i) => (
                <div key={i} className="card border p-4" style={{ borderRadius: '14px' }}>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="card-avatar" style={{ width: '36px', height: '36px', fontSize: '12px' }}>{r.init}</div>
                    <div className="flex-grow-1">
                      <div className="fw-medium" style={{ fontSize: '13px' }}>{r.from}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{r.date}</div>
                    </div>
                    <div style={{ fontSize: '12px' }}>{'⭐'.repeat(r.stars)}</div>
                  </div>
                  <p className="mb-0" style={{ fontSize: '13px', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.7 }}>{r.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⭐</div>
              <div className="fw-bold mb-2" style={{ fontFamily: 'Syne,sans-serif', fontSize: '16px' }}>No reviews yet</div>
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)' }}>Reviews from buyers will appear here after transactions.</p>
            </div>
          )
        )}
      </div>

      {/* DetailModal — opens when a card body is clicked. */}
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}

      {/* EditListingModal — opens when the Edit button on an owned card is clicked. */}
      {editItem && <EditListingModal item={editItem} onClose={() => setEditItem(null)} />}
    </>
  );
}
