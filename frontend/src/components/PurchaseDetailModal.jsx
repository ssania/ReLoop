// ── PurchaseDetailModal ───────────────────────────────────────────────────────
// Variant of DetailModal used in Profile → Awaiting Confirmation and Purchased.
// Shows full item details but replaces "Contact Seller" with the relevant action:
//   mode="pending"   → Yes I bought this / No I didn't
//   mode="purchased" → Give review / Edit review
//
// Props:
//   item        – listing object
//   mode        – "pending" | "purchased"
//   existing    – existing review object (purchased mode only)
//   onClose     – close callback
//   onConfirm   – confirm purchase callback (pending mode)
//   onReject    – reject purchase callback (pending mode)
//   onReview    – open review modal callback (purchased mode)

import { useEffect, useState } from 'react';
import { IMG_BG, formatDate } from '../data/constants';

function statusClass(s) {
  if (s === 'Available') return 'st-avail';
  if (s === 'In-talk')   return 'st-intalk';
  return 'st-sold';
}

export default function PurchaseDetailModal({ item, mode, existing, onClose, onConfirm, onReject, onReview }) {
  const bg       = IMG_BG[item.category] || IMG_BG.Other;
  const initials = item.owner.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const images   = item.imageUrls || [];
  const [current, setCurrent] = useState(0);

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

          {/* Hero image / carousel */}
          <div className="d-flex align-items-center justify-content-center position-relative overflow-hidden"
            style={{ height: 'clamp(200px,35vw,300px)', background: bg }}>

            <span className={`card-status position-absolute top-0 start-0 m-3 ${statusClass(item.status)}`} style={{ zIndex: 3 }}>
              <div className="card-status-dot"></div>
              <span className="card-status-label">{item.status}</span>
            </span>

            {images.length > 0 ? (
              <>
                <img src={images[current].url} alt={`${item.title} ${current + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                {images.length > 1 && (
                  <>
                    <button onClick={e => { e.stopPropagation(); setCurrent(i => (i - 1 + images.length) % images.length); }}
                      style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 3, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#fff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                    <button onClick={e => { e.stopPropagation(); setCurrent(i => (i + 1) % images.length); }}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 3, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#fff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                    <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', gap: '6px' }}>
                      {images.map((_, i) => (
                        <div key={i} onClick={e => { e.stopPropagation(); setCurrent(i); }}
                          style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === current ? '#fff' : 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'background 0.2s' }} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ fontSize: 'clamp(4rem,10vw,6rem)' }}>{item.emoji}</div>
            )}
          </div>

          {/* Modal body */}
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

            {/* Tag pills */}
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

            {/* Details grid */}
            <div className="mb-4">
              <div className="text-uppercase fw-semibold mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>Details</div>
              <div className="row g-2">
                {[['Condition', item.condition], ['Category', item.category], ['Status', item.status], ['Posted', formatDate(item.createdAt)]].map(([label, val]) => (
                  <div key={label} className="col-6">
                    <div className="p-3 rounded-3" style={{ background: 'var(--sand)', border: '1px solid var(--sand3)' }}>
                      <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '9px', letterSpacing: '1px', color: 'var(--muted)' }}>{label}</div>
                      <div className="fw-medium" style={{ fontSize: '13px' }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller */}
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

            {/* Actions — context-specific */}
            {mode === 'pending' && (
              <div className="d-flex gap-2">
                <button className="btn btn-dark flex-grow-1 rounded-3 py-3" style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '14px' }}
                  onClick={() => { onConfirm(); onClose(); }}>
                  ✅ Yes, I bought this
                </button>
                <button className="btn btn-outline-danger flex-grow-1 rounded-3 py-3" style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '14px' }}
                  onClick={() => { onReject(); onClose(); }}>
                  ❌ No, I didn't
                </button>
              </div>
            )}

            {mode === 'purchased' && (
              <div>
                {existing && (
                  <div className="mb-3 p-3 rounded-3" style={{ background: 'var(--sand)', border: '1px solid var(--sand3)' }}>
                    <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '9px', letterSpacing: '1px', color: 'var(--muted)' }}>Your review</div>
                    <span style={{ color: '#f59e0b', fontSize: '15px' }}>{'★'.repeat(existing.stars)}{'☆'.repeat(5 - existing.stars)}</span>
                    {existing.comment && <p className="mb-0 mt-1" style={{ fontSize: '12px', fontWeight: 300, color: 'var(--faint)', fontStyle: 'italic' }}>"{existing.comment}"</p>}
                  </div>
                )}
                <button
                  className="btn w-100 rounded-3 py-3 text-white fw-medium"
                  style={{ background: '#18181b', fontFamily: 'DM Sans,sans-serif', fontSize: '14px' }}
                  onClick={() => { onReview(); onClose(); }}
                >
                  {existing ? '✏️ Edit review' : '⭐ Give review'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
