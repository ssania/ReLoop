// ── Marketplace listing detail modal ──────────────────────────────────────────
// Opens when the user clicks a CardA. Shows full listing info plus actions.
//
// Props:
//   item    – the listing object to display (from AppContext.listings)
//   onClose – callback to clear selectedItem in the parent (unmounts this modal)
//
// Body-scroll lock: while the modal is open, overflow:hidden is applied to
// document.body so the page behind doesn't scroll. The useEffect cleanup
// function restores the original value when the modal unmounts.
//
// Backdrop close: the outermost div IS the backdrop. Clicking it (i.e. the
// click target equals the currentTarget, meaning no inner element was clicked)
// calls onClose, which is the standard modal UX pattern.

import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { IMG_BG } from '../data/mockData';

// statusClass: returns the CSS class name for the coloured status badge.
function statusClass(s) {
  if (s === 'Available') return 'st-avail';  // green
  if (s === 'In-talk') return 'st-intalk';   // amber
  return 'st-sold';                           // red
}

export default function DetailModal({ item, onClose }) {
  const { savedIds, toggleSave, showToast } = useApp();

  // Derive save state for this specific item.
  const saved = savedIds.has(item.id);

  // Category gradient background for the hero image area.
  const bg = IMG_BG[item.cat] || IMG_BG.Other;

  // Lock body scroll while modal is open; restore on unmount.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    // Backdrop – clicking the backdrop div (not its children) closes the modal.
    <div className="modal fade show d-block" tabIndex="-1"
      style={{ background: 'rgba(24,24,27,.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      {/* modal-lg gives extra width; modal-dialog-scrollable allows the body
          to scroll independently while the modal stays centred on screen.    */}
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content rounded-4 position-relative overflow-hidden">

          {/* Floating close button – absolute-positioned in the top-right corner. */}
          <button className="dm-close" onClick={onClose}>✕</button>

          {/* ── Hero image area ── */}
          <div className="d-flex align-items-center justify-content-center position-relative overflow-hidden"
            style={{ height: 'clamp(200px,35vw,300px)', background: bg }}>
            {/* Status badge overlaid on the hero image. */}
            <span className={`card-status position-absolute top-0 start-0 m-3 ${statusClass(item.status)}`}>
              <div className="card-status-dot"></div>
              <span className="card-status-label">{item.status}</span>
            </span>
            {/* Emoji scales fluidly with viewport width. */}
            <div style={{ fontSize: 'clamp(4rem,10vw,6rem)' }}>{item.emoji}</div>
          </div>

          {/* ── Modal body ── */}
          <div className="modal-body p-4">

            {/* Title + price row. */}
            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
              <div>
                <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>{item.cat}</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800, letterSpacing: '-.6px', lineHeight: 1.2 }}>{item.title}</div>
              </div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(26px,5vw,34px)', fontWeight: 800, letterSpacing: '-1px', flexShrink: 0 }}>
                ${item.price}
              </div>
            </div>

            {/* Tag pills – includes item.cond as an extra pill alongside item.tags. */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {item.tags.map(t => (
                <span key={t} className="badge rounded-pill border" style={{ background: 'var(--sand)', color: 'var(--faint)', fontSize: '10px', fontWeight: 400 }}>{t}</span>
              ))}
              <span className="badge rounded-pill border" style={{ background: 'var(--sand)', color: 'var(--faint)', fontSize: '10px', fontWeight: 400 }}>{item.cond}</span>
            </div>

            {/* Description section. */}
            <div className="mb-4">
              <div className="text-uppercase fw-semibold mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>Description</div>
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.8 }}>{item.desc}</p>
            </div>

            {/* Details grid – 4 key-value pairs in a 2-column Bootstrap grid. */}
            <div className="mb-4">
              <div className="text-uppercase fw-semibold mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>Details</div>
              <div className="row g-2">
                {[['Condition', item.cond], ['Category', item.cat], ['Status', item.status], ['Posted', item.posted]].map(([label, val]) => (
                  <div key={label} className="col-6">
                    <div className="p-3 rounded-3" style={{ background: 'var(--sand)', border: '1px solid var(--sand3)' }}>
                      <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '9px', letterSpacing: '1px', color: 'var(--muted)' }}>{label}</div>
                      <div className="fw-medium" style={{ fontSize: '13px' }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller section – avatar, name, rating. */}
            <div className="mb-4">
              <div className="text-uppercase fw-semibold mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>Seller</div>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'var(--sand)', border: '1px solid var(--sand3)' }}>
                <div className="dm-seller-avatar">{item.init}</div>
                <div>
                  <div className="fw-bold" style={{ fontFamily: 'Syne,sans-serif', fontSize: '14px' }}>{item.seller}</div>
                  <div style={{ fontSize: '11px', fontWeight: 300, color: 'var(--muted)', marginTop: '2px' }}>⭐ {item.rating.toFixed(1)} · Verified UMass student</div>
                </div>
              </div>
            </div>

            {/* Action row: "Message seller" fires a toast; save button toggles savedIds. */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-dark flex-grow-1 rounded-3 py-3"
                style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '14px' }}
                // Shows a toast with just the seller's first name for brevity.
                onClick={() => showToast(`Message sent to ${item.seller.split(' ')[0]}!`, '💬')}
              >
                💬 Message seller
              </button>
              {/* Save toggle – .saved class fills the button with terra colour. */}
              <button className={`dm-btn-save${saved ? ' saved' : ''}`} onClick={() => toggleSave(item.id)}>
                {saved ? '♥' : '♡'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
