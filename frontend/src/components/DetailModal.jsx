// ── Marketplace listing detail modal ──────────────────────────────────────────
// Opens when the user clicks a CardA. Shows full listing info plus actions.
//
// Props:
//   item    – a listing object from AppContext.listings
//   onClose – callback to clear selectedItem in the parent (unmounts this modal)
//
// Field mapping (schema → display):
//   item.category        → eyebrow label + details grid
//   item.condition       → tag pill + details grid
//   item.description     → description paragraph
//   item.createdAt       → "Posted" tile (formatted via formatDate)
//   item.owner.name      → seller name + avatar initials
//   item.owner.avgRating → seller star rating

import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { IMG_BG, formatDate } from '../data/constants';

function statusClass(s) {
  if (s === 'Available') return 'st-avail';
  if (s === 'In-talk')   return 'st-intalk';
  return 'st-sold';
}

export default function DetailModal({ item, onClose }) {
  const { favoriteIds, toggleFavorite, showToast } = useApp();

  const saved    = favoriteIds.has(item.id);
  const bg       = IMG_BG[item.category] || IMG_BG.Other;
  const initials = item.owner.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="modal fade show d-block" tabIndex="-1"
      style={{ background: 'rgba(24,24,27,.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content rounded-4 position-relative overflow-hidden">

          <button className="dm-close" onClick={onClose}>✕</button>

          {/* ── Hero image area ── */}
          <div className="d-flex align-items-center justify-content-center position-relative overflow-hidden"
            style={{ height: 'clamp(200px,35vw,300px)', background: bg }}>
            <span className={`card-status position-absolute top-0 start-0 m-3 ${statusClass(item.status)}`}>
              <div className="card-status-dot"></div>
              <span className="card-status-label">{item.status}</span>
            </span>
            {/* Emoji placeholder — replaced by real image once imageUrls are populated. */}
            <div style={{ fontSize: 'clamp(4rem,10vw,6rem)' }}>{item.emoji}</div>
          </div>

          {/* ── Modal body ── */}
          <div className="modal-body p-4">

            {/* Title + price */}
            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
              <div>
                <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>
                  {item.category}
                </div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800, letterSpacing: '-.6px', lineHeight: 1.2 }}>
                  {item.title}
                </div>
              </div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(26px,5vw,34px)', fontWeight: 800, letterSpacing: '-1px', flexShrink: 0 }}>
                ${item.price}
              </div>
            </div>

            {/* Tag pills — condition appended as an extra pill. */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {item.tags.map(t => (
                <span key={t} className="badge rounded-pill border" style={{ background: 'var(--sand)', color: 'var(--faint)', fontSize: '10px', fontWeight: 400 }}>{t}</span>
              ))}
              <span className="badge rounded-pill border" style={{ background: 'var(--sand)', color: 'var(--faint)', fontSize: '10px', fontWeight: 400 }}>{item.condition}</span>
            </div>

            {/* Description */}
            <div className="mb-4">
              <div className="text-uppercase fw-semibold mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>Description</div>
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.8 }}>{item.description}</p>
            </div>

            {/* Details grid — createdAt formatted for display. */}
            <div className="mb-4">
              <div className="text-uppercase fw-semibold mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>Details</div>
              <div className="row g-2">
                {[
                  ['Condition', item.condition],
                  ['Category',  item.category],
                  ['Status',    item.status],
                  ['Posted',    formatDate(item.createdAt)],
                ].map(([label, val]) => (
                  <div key={label} className="col-6">
                    <div className="p-3 rounded-3" style={{ background: 'var(--sand)', border: '1px solid var(--sand3)' }}>
                      <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '9px', letterSpacing: '1px', color: 'var(--muted)' }}>{label}</div>
                      <div className="fw-medium" style={{ fontSize: '13px' }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller — owner.name and owner.avgRating from the populated owner object. */}
            <div className="mb-4">
              <div className="text-uppercase fw-semibold mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>Seller</div>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'var(--sand)', border: '1px solid var(--sand3)' }}>
                <div className="dm-seller-avatar">{initials}</div>
                <div>
                  <div className="fw-bold" style={{ fontFamily: 'Syne,sans-serif', fontSize: '14px' }}>{item.owner.name}</div>
                  <div style={{ fontSize: '11px', fontWeight: 300, color: 'var(--muted)', marginTop: '2px' }}>
                    ⭐ {item.owner.avgRating.toFixed(1)} · Verified UMass student
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-dark flex-grow-1 rounded-3 py-3"
                style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '14px' }}
                onClick={() => showToast(`Message sent to ${item.owner.name.split(' ')[0]}!`, '💬')}
              >
                💬 Contact seller
              </button>
              <button className={`dm-btn-save${saved ? ' saved' : ''}`} onClick={() => toggleFavorite(item.id)}>
                {saved ? '♥' : '♡'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
