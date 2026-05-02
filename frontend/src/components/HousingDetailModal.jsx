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

import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../data/constants';

// Hardcoded current user until JWT auth is implemented; matches the
// "John Doe" identity used on the Profile page.
const CURRENT_USER_NAME = 'John Doe';

export default function HousingDetailModal({ h, onClose }) {
  // showToast powers the "Contact area managers" toast.
  // addHousingReview posts to /api/housing/:areaId/reviews and updates context.
  const { showToast, addHousingReview } = useApp();

  // Review-form local state.
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Lock body scroll while modal is open; restore on unmount.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!comment.trim()) {
      showToast('Add a short comment first', '✏️');
      return;
    }
    setSubmitting(true);
    const ok = await addHousingReview(h.id, {
      reviewerName: CURRENT_USER_NAME,
      stars,
      comment: comment.trim(),
    });
    setSubmitting(false);
    if (ok) {
      setStars(5);
      setComment('');
    }
  };

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
                {[['Distance', h.distance], ['Rent range', `$${h.rentMin.toLocaleString()} – $${h.rentMax.toLocaleString()}/mo`], ['Area rating', `⭐ ${h.averageRating.toFixed(1)} (${h.reviewCount} reviews)`], ['Typical type', h.type]].map(([label, val]) => (
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

            {/* Map placeholder – will be replaced by a real Google Maps embed.
                Two .hdm-map-pin elements represent the neighbourhood and UMass campus. */}
            <Section title="Location map">
              <div className="rounded-3 position-relative d-flex align-items-center justify-content-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#e8f0e8,#d0e0d0)', height: '180px', border: '1px solid var(--sage-bd)' }}>
                {/* Neighbourhood pin (terra/orange). */}
                <div className="hdm-map-pin"></div>
                {/* UMass campus pin (sage/green). */}
                <div className="hdm-map-pin umass" style={{ top: '62%', left: '62%' }}></div>
                <div className="px-3 py-2 rounded-2 fw-medium" style={{ background: 'rgba(255,255,255,.8)', fontSize: '11px', color: 'var(--sage)', marginTop: '80px' }}>
                  📍 {h.name} · 🎓 UMass Campus
                </div>
              </div>
              <p className="mt-2 mb-0" style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 300 }}>Full interactive map with Google Maps integration coming in the live version.</p>
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

              {/* Inline review form. Posts to /api/housing/:areaId/reviews via
                  addHousingReview; the response merges into context so the new
                  review appears at the top of the list above without a refetch. */}
              <form onSubmit={handleSubmit} className="p-3 rounded-3 mt-2" style={{ background: 'var(--sand)', border: '1px solid var(--sand3)' }}>
                <div className="text-uppercase fw-semibold mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)' }}>
                  Leave a review as {CURRENT_USER_NAME}
                </div>

                {/* Star picker – click a star to set the rating 1–5. */}
                <div className="d-flex align-items-center gap-1 mb-2" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={stars === n}
                      aria-label={`${n} star${n === 1 ? '' : 's'}`}
                      onClick={() => setStars(n)}
                      className="btn p-0"
                      style={{ fontSize: '18px', lineHeight: 1, opacity: n <= stars ? 1 : 0.3, background: 'transparent', border: 'none' }}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="ms-2" style={{ fontSize: '11px', color: 'var(--muted)' }}>{stars}/5</span>
                </div>

                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share what it's like to live here…"
                  rows={3}
                  maxLength={500}
                  className="form-control mb-2"
                  style={{ fontSize: '12px', fontWeight: 300, resize: 'vertical' }}
                />

                <div className="d-flex align-items-center justify-content-between">
                  <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{comment.length}/500</span>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn rounded-3 fw-medium text-white"
                    style={{ background: 'var(--sage)', fontSize: '12px', padding: '6px 16px', opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? 'Posting…' : 'Post review'}
                  </button>
                </div>
              </form>
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
