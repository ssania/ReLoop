// ── Housing neighbourhood detail modal ───────────────────────────────────────
// Opens when the user clicks a HousingCard. Presents the full neighbourhood
// profile with: about text, key stats, floor plans, amenities, bus routes,
// a map placeholder, and student reviews.
//
// Props:
//   h       – a housing object from AppContext.housing (fetched from GET /api/housing)
//   onClose – clears selectedH in Housing.jsx (unmounts this modal)
//
// Body-scroll lock and backdrop-click-to-close follow the same pattern as
// DetailModal (see that file for the explanation).

import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../data/constants';

export default function HousingDetailModal({ h, onClose }) {
  // showToast is used for the "Contact area managers" button at the bottom.
  const { showToast } = useApp();

  // Lock body scroll while modal is open; restore on unmount.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    // Backdrop – click outside the modal dialog to close.
    <div className="modal fade show d-block" tabIndex="-1"
      style={{ background: 'rgba(24,24,27,.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content rounded-4 position-relative overflow-hidden">

          {/* Floating close button. */}
          <button className="dm-close" onClick={onClose}>✕</button>

          {/* ── Hero image area ── */}
          <div className="d-flex align-items-center justify-content-center overflow-hidden"
            style={{ height: 'clamp(160px,28vw,240px)', background: 'linear-gradient(135deg,#e8f0f5,#ccdcec)', borderRadius: '1rem 1rem 0 0' }}>
            <div style={{ fontSize: 'clamp(3rem,8vw,5rem)' }}>{h.emoji}</div>
          </div>

          {/* ── Modal body ── */}
          <div className="modal-body p-4">

            {/* Kicker row – type + "Housing Hub" label with sage dot. */}
            <div className="d-flex align-items-center gap-2 mb-2 text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--sage)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sage)', flexShrink: 0 }}></div>
              {h.type} · Housing Hub
            </div>

            {/* Neighbourhood name and rent range headline. */}
            <h5 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, letterSpacing: '-.8px' }}>{h.name}</h5>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, letterSpacing: '-.8px' }}>
              ${h.rentMin.toLocaleString()} – ${h.rentMax.toLocaleString()}
            </div>
            <p className="mb-4" style={{ fontSize: '12px', fontWeight: 300, color: 'var(--muted)' }}>Typical monthly rent range in this area</p>

            {/* About – full neighbourhood description paragraph. */}
            <Section title="About this area">
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.8 }}>{h.description}</p>
            </Section>

            {/* Key info – 4 stat tiles in a 2-column Bootstrap grid. */}
            <Section title="Key info">
              <div className="row g-2">
                {[['Distance', `${h.distance} mi from campus`], ['Rent range', `$${h.rentMin.toLocaleString()} – $${h.rentMax.toLocaleString()}/mo`], ['Area rating', `⭐ ${h.averageRating.toFixed(1)} (${h.reviewCount} reviews)`], ['Typical type', h.type]].map(([label, val]) => (
                  <div key={label} className="col-6">
                    <div className="p-3 rounded-3" style={{ background: 'var(--sand)', border: '1px solid var(--sand3)' }}>
                      <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '9px', letterSpacing: '1px', color: 'var(--muted)' }}>{label}</div>
                      <div className="fw-medium" style={{ fontSize: '13px' }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Floor plans – renders S3 images when available; placeholder shown until images are uploaded. */}
            <Section title="Floor plans available">
              <div className="row g-2">
                {h.floorPlanUrls.map(fp => (
                  <div key={fp.key} className="col-12 col-sm-6">
                    {/* TODO: replace placeholder with <img src={fp.url} /> once floor plan images are uploaded to S3 */}
                    <div className="p-3 rounded-3 d-flex align-items-center justify-content-center"
                      style={{ background: 'var(--sand)', border: '1px solid var(--sand3)', height: '100px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>🖼️ Floor plan image</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Amenities – sage-green checkmark pills. */}
            <Section title="Common amenities">
              <div className="d-flex flex-wrap gap-2">
                {h.amenities.map(a => (
                  <span key={a} className="badge rounded-pill px-3 py-2" style={{ background: 'var(--sage-bg)', color: 'var(--sage)', border: '1px solid var(--sage-bd)', fontWeight: 500, fontSize: '11px' }}>✓ {a}</span>
                ))}
              </div>
            </Section>

            {/* Bus routes – same sage-green style with bus emoji. */}
            <Section title="Bus routes to UMass">
              <div className="d-flex flex-wrap gap-2">
                {h.busRoutes.map(b => (
                  <span key={b} className="badge rounded-pill px-3 py-2 fw-semibold" style={{ background: 'var(--sage-bg)', color: 'var(--sage)', border: '1px solid var(--sage-bd)', fontSize: '11px' }}>🚌 {b}</span>
                ))}
              </div>
            </Section>

            <Section title="Location map">
              {h.mapEmbedUrl ? (
                <div className="rounded-3 overflow-hidden" style={{ border: '1px solid var(--sage-bd)', height: '300px' }}>
                  <iframe
                    src={h.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map for ${h.name}`}
                  />
                </div>
              ) : (
                <div className="rounded-3 position-relative d-flex align-items-center justify-content-center overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#e8f0e8,#d0e0d0)', height: '180px', border: '1px solid var(--sage-bd)' }}>
                  <div className="hdm-map-pin"></div>
                  <div className="hdm-map-pin umass" style={{ top: '62%', left: '62%' }}></div>
                  <div className="px-3 py-2 rounded-2 fw-medium" style={{ background: 'rgba(255,255,255,.8)', fontSize: '11px', color: 'var(--sage)', marginTop: '80px' }}>
                    📍 {h.name} · 🎓 UMass Campus
                  </div>
                </div>
              )}
            </Section>

            {/* Student reviews – pulled from h.housingReviews. */}
            <Section title="Student reviews">
              <div className="d-flex flex-column gap-2">
                {h.housingReviews.map((r, i) => (
                  <div key={i} className="p-3 rounded-3" style={{ background: 'var(--sand)', border: '1px solid var(--sand3)' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-medium" style={{ fontSize: '12px' }}>{r.reviewer.name}</span>
                      <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{formatDate(r.createdAt)} · {'⭐'.repeat(r.stars)}</span>
                    </div>
                    <p className="mb-0" style={{ fontSize: '12px', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.6 }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* CTA – fires a toast to simulate sending a contact request. */}
            <button
              className="btn w-100 rounded-3 py-3 text-white fw-medium mt-2"
              style={{ background: 'var(--sage)', fontFamily: 'DM Sans,sans-serif' }}
              onClick={() => showToast(`Request sent for ${h.name}!`, '📧')}
            >
              📧 Contact area managers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Section: local layout helper to avoid repeating the label + children wrapper
// for each of the modal's content blocks (About, Key info, Floor plans, etc.).
function Section({ title, children }) {
  return (
    <div className="mb-4">
      {/* Section heading – small uppercase label consistent with the app's style. */}
      <div className="text-uppercase fw-semibold mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>{title}</div>
      {children}
    </div>
  );
}
