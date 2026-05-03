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
//
// Field mapping (schema → display):
//   item.category        → category eyebrow label
//   item.condition       → condition badge
//   item.owner.name      → seller name + avatar initials
//   item.owner.avgRating → star rating

import { useApp } from '../context/AppContext';
import { IMG_BG } from '../data/constants';

// statusClass: maps a listing's status string to the CSS class that controls
// the coloured dot + text in the top-left badge of the image area.
function statusClass(s) {
  if (s === 'Available') return 'st-avail';  // green
  if (s === 'In-talk')   return 'st-intalk'; // amber
  return 'st-sold';                           // red
}

export default function CardA({ item, onClick }) {
  const { favoriteIds, toggleFavorite } = useApp();

  const saved = favoriteIds.has(item.id);

  // Gradient background keyed on category; falls back to 'Other'.
  const bg = IMG_BG[item.category] || IMG_BG.Other;

  // Derive initials from the populated owner name.
  const initials = item.owner.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="card-a card border h-100" onClick={() => onClick(item)}>

      {/* ── Image area ── */}
      <div className="position-relative d-flex align-items-center justify-content-center overflow-hidden"
        style={{ height: '180px', background: bg }}>

        <span className={`card-status position-absolute top-0 start-0 m-2 ${statusClass(item.status)}`} style={{ zIndex: 1 }}>
          <div className="card-status-dot"></div>
          <span className="card-status-label">{item.status}</span>
        </span>

        <button
          className={`card-save position-absolute top-0 end-0 m-2 ${saved ? 'saved' : ''}`}
          style={{ zIndex: 1 }}
          onClick={e => { e.stopPropagation(); toggleFavorite(item.id); }}
        >
          {saved ? '♥' : '♡'}
        </button>

        {item.imageUrls?.length > 0
          ? <img src={item.imageUrls[0].url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, zIndex: 0 }} />
          : <div className="card-emoji">{item.emoji}</div>
        }
      </div>

      {/* ── Card body ── */}
      <div className="card-body p-3">

        <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '9px', letterSpacing: '1.5px', color: 'var(--muted)' }}>
          {item.category}
        </div>

        <div className="fw-bold text-truncate mb-2" style={{ fontFamily: 'Syne,sans-serif', fontSize: '14px', letterSpacing: '-.3px' }}>
          {item.title}
        </div>

        <div className="d-flex align-items-center justify-content-between mb-2">
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '20px', fontWeight: 800, letterSpacing: '-.6px' }}>
            ${item.price}
          </div>
          <span className="badge rounded-pill border" style={{ background: 'var(--sand)', color: 'var(--faint)', fontSize: '10px', fontWeight: 400, borderColor: 'var(--sand3)!important' }}>
            {item.condition}
          </span>
        </div>

        {/* Seller row — owner.name and owner.avgRating from the populated owner object. */}
        <div className="d-flex align-items-center justify-content-between pt-2 border-top" style={{ borderColor: 'var(--sand2)!important' }}>
          <div className="d-flex align-items-center gap-2">
            <div className="card-avatar">{initials}</div>
            <span style={{ fontSize: '11px', color: 'var(--faint)' }}>{item.owner.name}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--faint)' }}>⭐ {item.owner.avgRating.toFixed(1)}</span>
        </div>

      </div>
    </div>
  );
}
