// ── ReviewModal ───────────────────────────────────────────────────────────────
// Used for both submitting a new review and editing an existing one.
//
// Props:
//   listing    – the purchased listing being reviewed
//   existing   – existing review object if editing, null if new
//   onClose    – callback to unmount the modal
//   onSaved    – callback(review) called after successful create or edit
//   onDeleted  – callback() called after successful delete (edit mode only)

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5002/api';

export default function ReviewModal({ listing, existing, onClose, onSaved, onDeleted }) {
  const { token } = useAuth();
  const isEdit = !!existing;
  const [stars,   setStars]   = useState(existing?.stars ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (stars === 0) { setError('Please select a star rating.'); return; }
    setLoading(true);
    setError('');
    try {
      const url    = isEdit ? `${API}/reviews/${existing._id}` : `${API}/reviews`;
      const method = isEdit ? 'PATCH' : 'POST';
      const body   = isEdit
        ? { stars, comment }
        : { listingId: listing.id, stars, comment };

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Something went wrong.'); return; }
      onSaved(data);
      onClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete your review? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await fetch(`${API}/reviews/${existing._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      onDeleted();
      onClose();
    } catch {
      setError('Failed to delete review.');
    } finally {
      setDeleting(false);
    }
  }

  const displayed = hovered || stars;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ background: 'rgba(24,24,27,.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
        <div className="modal-content rounded-4 p-4 border-0">

          <div className="d-flex align-items-center justify-content-between mb-3">
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '16px', fontWeight: 800, letterSpacing: '-.4px' }}>
              {isEdit ? 'Edit your review' : 'Review this seller'}
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}
            >✕</button>
          </div>

          {/* Listing context */}
          <div className="mb-3 p-3 rounded-3" style={{ background: 'var(--sand)', border: '1px solid var(--sand3)', fontSize: '13px' }}>
            <div className="fw-medium">{listing.title}</div>
            <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px' }}>
              Sold by {listing.owner?.name} · ${listing.price}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Star picker */}
            <div className="mb-3">
              <div className="text-uppercase fw-semibold mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>
                Rating
              </div>
              <div className="d-flex gap-1" onMouseLeave={() => setHovered(0)}>
                {[1, 2, 3, 4, 5].map(n => (
                  <span
                    key={n}
                    onMouseEnter={() => setHovered(n)}
                    onClick={() => setStars(n)}
                    style={{
                      fontSize: '28px',
                      cursor: 'pointer',
                      color: n <= displayed ? '#f59e0b' : '#d1d5db',
                      transition: 'color 0.1s',
                      userSelect: 'none',
                    }}
                  >★</span>
                ))}
              </div>
              {stars > 0 && (
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][stars]}
                </div>
              )}
            </div>

            {/* Comment */}
            <div className="mb-3">
              <div className="text-uppercase fw-semibold mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>
                Comment <span style={{ fontWeight: 300, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </div>
              <textarea
                className="form-control rounded-3"
                rows={3}
                placeholder="Share your experience with this seller..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{ fontSize: '13px', resize: 'none' }}
              />
            </div>

            {error && (
              <div className="mb-3" style={{ fontSize: '12px', color: '#ef4444' }}>{error}</div>
            )}

            <div className="d-flex gap-2">
              {isEdit && (
                <button
                  type="button"
                  className="btn btn-outline-danger rounded-3"
                  style={{ fontSize: '13px' }}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              )}
              <button
                type="submit"
                className="btn btn-dark flex-grow-1 rounded-3"
                style={{ fontSize: '13px' }}
                disabled={loading || stars === 0}
              >
                {loading ? (isEdit ? 'Saving…' : 'Submitting…') : (isEdit ? 'Save changes' : 'Submit review')}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
