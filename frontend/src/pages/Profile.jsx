// ── Profile page ──────────────────────────────────────────────────────────────
// Logged-in user's dashboard at "/profile".
// Hardcoded to "John Doe" until real auth is wired up.
//
// Three tabs:
//   listings – only listings where ownedByUser === true (created by this user)
//   saved    – listings whose IDs are in AppContext.favoriteIds
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
import ReviewModal from '../components/ReviewModal';
import { formatDate } from '../data/constants';
import CreateListingModal from '../components/CreateListingModal';

const API = 'http://localhost:5002/api';

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
            <button
              className="btn btn-light flex-fill rounded-3"
              style={{ fontSize: '13px' }}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger flex-fill rounded-3"
              style={{ fontSize: '13px' }}
              onClick={onConfirm}
            >
              Yes, delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const TABS = [['listings', 'My listings'], ['saved', 'Saved items'], ['pending', 'Awaiting Confirmation'], ['purchased', 'Purchased'], ['reviews', 'Reviews']];

export default function Profile() {
  const { listings, favoriteIds, deleteListing, confirmPurchase, rejectPurchase, showToast } = useApp();
  const [tab, setTab] = useState('listings');

  // selectedItem: opens DetailModal when a card is clicked normally.
  const [selectedItem, setSelectedItem] = useState(null);

  // editItem: opens EditListingModal when the Edit button on an owned card is clicked.
  const [editItem, setEditItem] = useState(null);

  // deleteItem: opens DeleteConfirmModal when the Delete button is clicked.
  const [deleteItem, setDeleteItem] = useState(null);

  // createOpen: controls visibility of the CreateListingModal.
  const [createOpen, setCreateOpen] = useState(false);

  // reviewTarget: { listing, existing } — opens ReviewModal from Purchased tab.
  const [reviewTarget, setReviewTarget] = useState(null);

  // myReviews: reviews John Doe received as a seller. Fetched when Reviews tab opens.
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  // myGivenReviews: reviews John Doe submitted as a buyer, keyed by listingId.
  // Populated once so Purchased tab can show Edit vs Give Review.
  const [givenReviews, setGivenReviews] = useState({}); // { listingId: reviewDoc }

  // Fetch John Doe's own seller reviews when the Reviews tab is first opened.
  // His _id can be found from: a listing he owns OR a listing where he is the buyer.
  useEffect(() => {
    if (tab !== 'reviews' || reviewsLoaded) return;
    const johnListing = listings.find(l => l.owner?.name === 'John Doe');
    const johnBought  = listings.find(l => l.buyer?.name === 'John Doe');
    const sellerId = johnListing?.owner?._id ?? johnBought?.buyer?._id ?? null;
    if (!sellerId) return;
    fetch(`${API}/reviews?sellerId=${sellerId}`)
      .then(r => r.json())
      .then(data => { setMyReviews(data); setReviewsLoaded(true); })
      .catch(err => console.error('Failed to fetch seller reviews:', err));
  }, [tab, reviewsLoaded, listings]);

  // Fetch reviews John Doe has given as a buyer when Purchased tab opens.
  useEffect(() => {
    if (tab !== 'purchased') return;
    // Collect the seller IDs from purchased listings, then fetch reviews per listing.
    // Simpler: fetch all reviews where reviewer = John Doe by querying each listing.
    // We do this by fetching GET /api/reviews?sellerId for each unique seller and
    // cross-referencing, but that's expensive. Instead we store givenReviews by
    // listingId — the backend returns listingRef on each review doc.
    fetch(`${API}/reviews/given`)
      .then(r => r.json())
      .then(data => {
        const map = {};
        data.forEach(r => { map[r.listingRef] = r; });
        setGivenReviews(map);
      })
      .catch(() => {}); // endpoint added below
  }, [tab]);

  // myListings: listings owned by the current user (John Doe until auth is implemented).
  const myListings = listings.filter(m => m.owner?.name === 'John Doe');

  // favoriteItems: derived from the full listings array filtered by favoriteIds Set.
  const favoriteItems = listings.filter(m => favoriteIds.has(m.id));

  // asBuyer: listings where John Doe was nominated as buyer and needs to confirm/reject.
  const asBuyer = listings.filter(m => m.status === 'pending-confirmation' && m.buyer?.name === 'John Doe');

  // asSeller: listings where John Doe is the seller and has nominated a buyer, waiting for their response.
  const asSeller = listings.filter(m => m.status === 'pending-confirmation' && m.owner?.name === 'John Doe');

  // purchasedItems: listings John Doe confirmed buying.
  const purchasedItems = listings.filter(m => m.status === 'Sold' && m.buyer?.name === 'John Doe');

  // Stats: active count is live from myListings; favorites count is live from context.
  const statCards = [
    [myListings.length, 'Active listings'],
    [favoriteIds.size, 'Saved items'],
    ['4.8 ⭐', 'Seller rating'],
    ['Verified', 'Account status'],
  ];

  return (
    <>
      {/* ── PROFILE HERO ─────────────────────────────────────────────────── */}
      <div className="bg-white border-bottom" style={{ padding: 'clamp(24px,4vw,40px) clamp(16px,4vw,40px)' }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-4" style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div className="d-flex align-items-center gap-4">
            <div className="profile-avatar">JD</div>
            <div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800, letterSpacing: '-.5px' }}>John Doe</div>
              <div style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)', marginTop: '3px' }}>johndoe@umass.edu</div>
              <div className="verified-badge">✓ Verified UMass Student</div>
            </div>
          </div>
          {/* "Create listing" CTA – mirrors the same button in Marketplace. */}
          <button
            className="btn btn-dark rounded-3 d-flex align-items-center gap-2"
            style={{ fontSize: '13px', padding: '10px 20px', flexShrink: 0 }}
            onClick={() => setCreateOpen(true)}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></svg>
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
                  {/* Wrapper positions the action buttons over the card. */}
                  <div className="position-relative h-100">
                    <CardA item={item} onClick={setSelectedItem} />
                    {/* Action buttons — stopPropagation so they don't also open DetailModal. */}
                    <div
                      className="position-absolute d-flex gap-2"
                      style={{ bottom: '12px', right: '12px', zIndex: 2 }}
                    >
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
            // Empty state — shown until the user creates their first listing.
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

        {/* ── Awaiting Confirmation tab ─────────────────────────────────── */}
        {tab === 'pending' && (
          <div className="row g-4">
            {/* As Buyer */}
            <div className="col-12 col-md-6">
              <div className="fw-semibold mb-3" style={{ fontFamily: 'Syne,sans-serif', fontSize: '14px', letterSpacing: '-.2px' }}>
                As Buyer
              </div>
              {asBuyer.length ? (
                <div className="d-flex flex-column gap-3">
                  {asBuyer.map(item => (
                    <div key={item.id} className="card border p-4 rounded-4">
                      <div className="fw-bold text-truncate" style={{ fontFamily: 'Syne,sans-serif', fontSize: '14px' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        ${item.price} · {item.condition} · Seller: {item.owner?.name}
                      </div>
                      <div className="mt-1 mb-3" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        ⏳ {item.owner?.name} nominated you as the buyer.
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-dark btn-sm rounded-3 flex-grow-1"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => confirmPurchase(item.id)}
                        >
                          ✅ Yes, I bought this
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm rounded-3 flex-grow-1"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => rejectPurchase(item.id)}
                        >
                          ❌ No, I didn't
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5" style={{ background: 'var(--sand)', borderRadius: '14px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 300 }}>No nominations yet</div>
                </div>
              )}
            </div>

            {/* As Seller */}
            <div className="col-12 col-md-6">
              <div className="fw-semibold mb-3" style={{ fontFamily: 'Syne,sans-serif', fontSize: '14px', letterSpacing: '-.2px' }}>
                As Seller
              </div>
              {asSeller.length ? (
                <div className="d-flex flex-column gap-3">
                  {asSeller.map(item => (
                    <div key={item.id} className="card border p-4 rounded-4">
                      <div className="fw-bold text-truncate" style={{ fontFamily: 'Syne,sans-serif', fontSize: '14px' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        ${item.price} · {item.condition}
                      </div>
                      <div className="mt-1" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        ⏳ Waiting for <strong>{item.buyer?.name}</strong> to confirm.
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5" style={{ background: 'var(--sand)', borderRadius: '14px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤝</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 300 }}>No pending nominations</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Purchased tab ─────────────────────────────────────────────── */}
        {tab === 'purchased' && (
          purchasedItems.length ? (
            <div className="d-flex flex-column gap-3">
              {purchasedItems.map(item => {
                const existing = givenReviews[item.id] ?? null;
                return (
                  <div key={item.id} className="card border p-4 rounded-4">
                    <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="fw-bold text-truncate" style={{ fontFamily: 'Syne,sans-serif', fontSize: '15px' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                          ${item.price} · {item.condition} · Sold by {item.owner?.name}
                        </div>
                        {existing && (
                          <div className="mt-2 d-flex align-items-center gap-2">
                            <span style={{ color: '#f59e0b', fontSize: '13px' }}>
                              {'★'.repeat(existing.stars)}{'☆'.repeat(5 - existing.stars)}
                            </span>
                            {existing.comment && (
                              <span style={{ fontSize: '12px', color: 'var(--faint)', fontStyle: 'italic' }}>
                                "{existing.comment}"
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        className="btn btn-sm rounded-3"
                        style={{
                          fontSize: '12px',
                          padding: '6px 14px',
                          background: existing ? 'var(--sand)' : '#18181b',
                          color: existing ? 'var(--faint)' : '#fff',
                          border: existing ? '1px solid var(--sand3)' : 'none',
                          flexShrink: 0,
                        }}
                        onClick={() => setReviewTarget({ listing: item, existing })}
                      >
                        {existing ? '✏️ Edit review' : '⭐ Give review'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛍️</div>
              <div className="fw-bold mb-2" style={{ fontFamily: 'Syne,sans-serif', fontSize: '16px' }}>No purchases yet</div>
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)' }}>
                Items you've confirmed buying will appear here.
              </p>
            </div>
          )
        )}

        {/* ── Reviews tab ── reviews John Doe received as a seller ──────── */}
        {tab === 'reviews' && (
          myReviews.length ? (
            <div className="d-flex flex-column gap-3">
              {myReviews.map(r => (
                <div key={r._id} className="card border p-4" style={{ borderRadius: '14px' }}>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="card-avatar" style={{ width: '36px', height: '36px', fontSize: '12px' }}>
                      {r.reviewer?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium" style={{ fontSize: '13px' }}>{r.reviewer?.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{formatDate(r.createdAt)}</div>
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: '14px' }}>
                      {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="mb-0" style={{ fontSize: '13px', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.7 }}>{r.comment}</p>
                  )}
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

      {/* DeleteConfirmModal — opens when the Delete button on an owned card is clicked. */}
      {deleteItem && (
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

      {/* CreateListingModal — opened from the hero button; stays on Profile after submit. */}
      {createOpen && <CreateListingModal onClose={() => setCreateOpen(false)} />}

      {/* ReviewModal — opened from the Purchased tab. */}
      {reviewTarget && (
        <ReviewModal
          listing={reviewTarget.listing}
          existing={reviewTarget.existing}
          onClose={() => setReviewTarget(null)}
          onSaved={(savedReview) => {
            // Update givenReviews map so the card reflects the new/edited review immediately
            setGivenReviews(prev => ({
              ...prev,
              [reviewTarget.listing.id]: savedReview,
            }));
            showToast(reviewTarget.existing ? 'Review updated!' : 'Review submitted!', '⭐');
            // Invalidate seller reviews cache so Reviews tab refetches
            setReviewsLoaded(false);
          }}
          onDeleted={() => {
            setGivenReviews(prev => {
              const next = { ...prev };
              delete next[reviewTarget.listing.id];
              return next;
            });
            showToast('Review deleted', '🗑️');
            setReviewsLoaded(false);
          }}
        />
      )}
    </>
  );
}
