// ── Profile page ──────────────────────────────────────────────────────────────
// Logged-in user's dashboard at "/profile".
// Redirects to /login if no user is authenticated.
//
// Three tabs:
//   listings – only listings where ownedByUser === true (created by this user)
//   saved    – listings whose IDs are in AppContext.favoriteIds
//   reviews  – fetched from GET /api/reviews on mount

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import CardA from '../components/CardA';
import DetailModal from '../components/DetailModal';
import EditListingModal from '../components/EditListingModal';
import { formatDate } from '../data/constants';
import CreateListingModal from '../components/CreateListingModal';

// Inline confirmation modal — shown before permanently deleting a listing.
function DeleteConfirmModal({ item, onConfirm, onCancel }) {
  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onCancel}>
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: '420px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-content border-0 rounded-4 p-4">
          <div className="text-center mb-3" style={{ fontSize: '2.2rem' }}>🗑️</div>
          <h6 className="text-center fw-bold mb-1" style={{ fontFamily: 'Syne,sans-serif', fontSize: '16px' }}>
            Delete listing?
          </h6>
          <p className="text-center mb-4" style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 300 }}>
            <strong>{item.title}</strong> will be permanently removed and cannot be recovered.
          </p>
          <div className="d-flex gap-2">
            <button className="btn btn-light flex-fill rounded-3" style={{ fontSize: '13px' }} onClick={onCancel}>
              Cancel
            </button>
            <button className="btn btn-danger flex-fill rounded-3" style={{ fontSize: '13px' }} onClick={onConfirm}>
              Yes, delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const TABS = [['listings', 'My listings'], ['saved', 'Saved items'], ['reviews', 'Reviews']];

export default function Profile() {
  const { listings, favoriteIds, deleteListing, showToast } = useApp();
  const { user } = useAuth();          // ← real logged-in user
  const navigate  = useNavigate();

  // Redirect to login if not authenticated.
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const [tab, setTab]           = useState('listings');
  const [myReviews, setMyReviews] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editItem, setEditItem]         = useState(null);
  const [deleteItem, setDeleteItem]     = useState(null);
  const [createOpen, setCreateOpen]     = useState(false);

  // Fetch this user's received reviews from the backend on mount.
  useEffect(() => {
    fetch('http://localhost:5002/api/reviews')
      .then(res => res.json())
      .then(data => setMyReviews(data))
      .catch(err => console.error('Failed to fetch reviews:', err));
  }, []);

  // Don't render anything while redirecting.
  if (!user) return null;

  // Avatar initials derived from the real user's name.
  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // myListings: listings created by this user (flagged on create).
  const myListings    = listings.filter(m => m.ownedByUser === true);
  const favoriteItems = listings.filter(m => favoriteIds.has(m.id));

  const statCards = [
    [myListings.length, 'Active listings'],
    [favoriteIds.size,  'Saved items'],
    ['4.8 ⭐',          'Seller rating'],
    ['Verified',        'Account status'],
  ];

  return (
    <>
      {/* ── PROFILE HERO ─────────────────────────────────────────────────── */}
      <div className="bg-white border-bottom" style={{ padding: 'clamp(24px,4vw,40px) clamp(16px,4vw,40px)' }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-4" style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div className="d-flex align-items-center gap-4">
            {/* Avatar — initials from the real user name */}
            <div className="profile-avatar">{initials}</div>
            <div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800, letterSpacing: '-.5px' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)', marginTop: '3px' }}>
                {user.email}
              </div>
              <div className="verified-badge">✓ Verified UMass Student</div>
            </div>
          </div>
          <button
            className="btn btn-dark rounded-3 d-flex align-items-center gap-2"
            style={{ fontSize: '13px', padding: '10px 20px', flexShrink: 0 }}
            onClick={() => setCreateOpen(true)}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Create listing
          </button>
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

        {/* Stats grid */}
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
                  <div className="position-relative h-100">
                    <CardA item={item} onClick={setSelectedItem} />
                    <div className="position-absolute d-flex gap-2" style={{ bottom: '12px', right: '12px', zIndex: 2 }}>
                      <button
                        className="btn btn-sm btn-dark rounded-3"
                        style={{ fontSize: '11px', padding: '5px 12px' }}
                        onClick={e => { e.stopPropagation(); setEditItem(item); }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger rounded-3"
                        style={{ fontSize: '11px', padding: '5px 12px' }}
                        onClick={e => { e.stopPropagation(); setDeleteItem(item); }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
              <div className="fw-bold mb-2" style={{ fontFamily: 'Syne,sans-serif', fontSize: '16px' }}>No listings yet</div>
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)' }}>
                Hit <strong>"Create listing"</strong> above to post your first item.
              </p>
            </div>
          )
        )}

        {/* ── Saved items tab ───────────────────────────────────────────── */}
        {tab === 'saved' && (
          favoriteItems.length ? (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
              {favoriteItems.map(item => (
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
                    <div className="card-avatar" style={{ width: '36px', height: '36px', fontSize: '12px' }}>
                      {r.reviewer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium" style={{ fontSize: '13px' }}>{r.reviewer.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{formatDate(r.createdAt)}</div>
                    </div>
                    <div style={{ fontSize: '12px' }}>{'⭐'.repeat(r.stars)}</div>
                  </div>
                  <p className="mb-0" style={{ fontSize: '13px', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.7 }}>{r.comment}</p>
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

      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {editItem     && <EditListingModal item={editItem} onClose={() => setEditItem(null)} />}
      {deleteItem   && (
        <DeleteConfirmModal
          item={deleteItem}
          onCancel={() => setDeleteItem(null)}
          onConfirm={() => {
            deleteListing(deleteItem.id);
            showToast('Listing deleted', '🗑️');
            setDeleteItem(null);
          }}
        />
      )}
      {createOpen && <CreateListingModal onClose={() => setCreateOpen(false)} />}
    </>
  );
}