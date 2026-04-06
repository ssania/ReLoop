// ── Marketplace listing card ───────────────────────────────────────────────────
// Displayed in a responsive Bootstrap grid on:
//   • Home page    – 3 most-recent listings preview
//   • Marketplace  – full filtered listing grid
//   • Profile      – My Listings tab and Saved Items tab
//
// Props:
//   item    – a listing object from AppContext.listings
//   onClick – called with the item when the card body is clicked,
//             which opens DetailModal in the parent page

import { useApp } from '../context/AppContext';
import { IMG_BG } from '../data/mockData';

// statusClass: maps a listing's status string to the CSS class that controls
// the coloured dot + text in the top-left badge of the image area.
function statusClass(s) {
  if (s === 'Available') return 'st-avail';  // green
  if (s === 'In-talk') return 'st-intalk';   // amber
  return 'st-sold';                           // red
}

export default function CardA({ item, onClick }) {
  // Read savedIds and toggleSave from global context so the heart button
  // reflects the correct state and fires the correct mutation.
  const { savedIds, toggleSave } = useApp();

  // Derive whether this specific item is currently saved.
  const saved = savedIds.has(item.id);

  // Gradient background for the image area; falls back to the 'Other' gradient
  // if the category doesn't match a known key.
  const bg = IMG_BG[item.cat] || IMG_BG.Other;

  return (
    // Clicking anywhere on the card calls onClick(item), which the parent uses
    // to set selectedItem and open DetailModal.
    <div className="card-a card border h-100" onClick={() => onClick(item)}>

      {/* ── Image area ── */}
      <div className="position-relative d-flex align-items-center justify-content-center overflow-hidden"
        style={{ height: '180px', background: bg }}>

        {/* Status badge – top-left overlay with coloured dot and label. */}
        <span className={`card-status position-absolute top-0 start-0 m-2 ${statusClass(item.status)}`}>
          <div className="card-status-dot"></div>
          <span className="card-status-label">{item.status}</span>
        </span>

        {/* Save/unsave heart button – top-right overlay.
            e.stopPropagation() prevents the card's onClick from also firing. */}
        <button
          className={`card-save position-absolute top-0 end-0 m-2 ${saved ? 'saved' : ''}`}
          onClick={e => { e.stopPropagation(); toggleSave(item.id); }}
        >
          {saved ? '♥' : '♡'}
        </button>

        {/* Large emoji stands in for a real product photo. */}
        <div className="card-emoji">{item.emoji}</div>
      </div>

      {/* ── Card body ── */}
      <div className="card-body p-3">
        {/* Category label – small uppercase eyebrow text. */}
        <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '9px', letterSpacing: '1.5px', color: 'var(--muted)' }}>
          {item.cat}
        </div>

        {/* Title – truncated to one line to keep card heights consistent. */}
        <div className="fw-bold text-truncate mb-2" style={{ fontFamily: 'Syne,sans-serif', fontSize: '14px', letterSpacing: '-.3px' }}>
          {item.title}
        </div>

        {/* Price + condition badge row. */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '20px', fontWeight: 800, letterSpacing: '-.6px' }}>
            ${item.price}
          </div>
          <span className="badge rounded-pill border" style={{ background: 'var(--sand)', color: 'var(--faint)', fontSize: '10px', fontWeight: 400, borderColor: 'var(--sand3)!important' }}>
            {item.cond}
          </span>
        </div>

        {/* Seller info row – avatar initials, name, and star rating. */}
        <div className="d-flex align-items-center justify-content-between pt-2 border-top" style={{ borderColor: 'var(--sand2)!important' }}>
          <div className="d-flex align-items-center gap-2">
            <div className="card-avatar">{item.init}</div>
            <span style={{ fontSize: '11px', color: 'var(--faint)' }}>{item.seller}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--faint)' }}>⭐ {item.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
