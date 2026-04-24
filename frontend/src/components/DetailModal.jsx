import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { IMG_BG, formatDate } from '../data/constants';

function statusClass(s) {
  if (s === 'Available') return 'st-avail';
  if (s === 'In-talk') return 'st-intalk';
  return 'st-sold';
}

export default function DetailModal({ item, onClose }) {
  const { savedIds, toggleSave, showToast } = useApp();

  const saved = savedIds.has(item.id);
  const bg = IMG_BG[item.category] || IMG_BG.Other;
  const initials = item.owner.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ background: 'rgba(24,24,27,.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content rounded-4 position-relative overflow-hidden">

          <button className="dm-close" onClick={onClose}>✕</button>

          {/* IMAGE HEADER */}
          <div
            className="d-flex align-items-center justify-content-center position-relative overflow-hidden"
            style={{ height: 'clamp(200px,35vw,300px)', background: bg }}
          >
            <span className={`card-status position-absolute top-0 start-0 m-3 ${statusClass(item.status)}`}>
              <div className="card-status-dot"></div>
              <span className="card-status-label">{item.status}</span>
            </span>

            <div style={{ fontSize: 'clamp(4rem,10vw,6rem)' }}>
              {item.emoji}
            </div>
          </div>

          <div className="modal-body p-4">

            {/* TITLE + PRICE */}
            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
              <div>
                <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>
                  {item.category}
                </div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800 }}>
                  {item.title}
                </div>
              </div>

              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(26px,5vw,34px)', fontWeight: 800 }}>
                ${item.price}
              </div>
            </div>

            {/* TAGS */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {item.tags.map(t => (
                <span key={t} className="badge rounded-pill border">{t}</span>
              ))}
              <span className="badge rounded-pill border">{item.condition}</span>
            </div>

            {/* DESCRIPTION */}
            <div className="mb-4">
              <div>Description</div>
              <p>{item.description}</p>
            </div>

            {/* DETAILS */}
            <div className="mb-4">
              <div>Details</div>
              <div className="row g-2">
                {[
                  ['Condition', item.condition],
                  ['Category', item.category],
                  ['Status', item.status],
                  ['Posted', formatDate(item.createdAt)],
                ].map(([label, val]) => (
                  <div key={label} className="col-6">
                    <div className="p-3 rounded-3">
                      <div>{label}</div>
                      <div>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SELLER */}
            <div className="mb-4">
              <div>Seller</div>
              <div className="d-flex align-items-center gap-3 p-3 rounded-3">
                <div className="dm-seller-avatar">{initials}</div>
                <div>
                  <div>{item.owner.name}</div>
                  <div>
                    ⭐ {item.owner.avgRating.toFixed(1)} · Verified UMass student
                  </div>
                </div>
              </div>
            </div>

            {/* CONTACT + SAVE */}
            <div className="d-flex gap-2">

              <a
                href={`mailto:${item.owner.email}?subject=Interested in ${item.title}&body=Hi ${item.owner.name.split(' ')[0]}, I am interested in your listing for ${item.title} ($${item.price}). Is it still available?`}
                onClick={() => showToast('Opening email client...', '💬')}
                className="btn btn-dark flex-grow-1 rounded-3 py-3 text-decoration-none text-center"
              >
                💬 Contact Seller
              </a>

              <button
                className={`dm-btn-save${saved ? ' saved' : ''}`}
                onClick={() => toggleSave(item.id)}
              >
                {saved ? '♥' : '♡'}
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}