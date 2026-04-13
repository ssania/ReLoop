// ── Home page ─────────────────────────────────────────────────────────────────
// The public landing page, accessible at "/".
// Sections (top to bottom):
//   1. Hero          – headline, sub-copy, two CTA buttons, service cards
//   2. Stats row     – 4 headline numbers about the platform
//   3. Recent listings – first 3 items from AppContext.listings
//   4. Footer        – site info strip
//
// DetailModal is opened locally when the user clicks a listing card.
// No auth or filter state needed on this page.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CardA from '../components/CardA';
import DetailModal from '../components/DetailModal';

export default function Home() {
  // listings comes from AppContext so newly created items appear here too.
  const { listings } = useApp();
  const navigate = useNavigate();

  // selectedItem: null when no modal is open; set to a listing object to open DetailModal.
  const [selectedItem, setSelectedItem] = useState(null);

  // Static platform stats shown in the stats row below the hero.
  const stats = [
    ['6', 'Neighborhoods'], ['1,240', 'Marketplace items'],
    ['3,800+', 'Verified students'], ['×5', 'Colleges'],
  ];

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────────
          position:relative + overflow:hidden contains the decorative blob
          divs which use absolute positioning.                                   */}
      <div className="border-bottom position-relative overflow-hidden"
        style={{ background: 'var(--sand)', padding: 'clamp(40px,7vw,72px) clamp(16px,4vw,40px) clamp(40px,6vw,64px)' }}>

        {/* Decorative blobs – purely visual, pointer-events:none in CSS. */}
        <div className="hero-blob"></div>
        <div className="hero-blob2"></div>

        <div className="position-relative" style={{ maxWidth: '1160px', margin: '0 auto' }}>

          {/* Eyebrow tag pill above the headline. */}
          <div className="d-inline-flex align-items-center gap-2 bg-white border rounded-pill px-3 py-1 mb-4">
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--terra)', flexShrink: 0 }}></div>
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--faint)', letterSpacing: '.2px' }}>UMass Amherst Community</span>
          </div>

          {/* Main headline – clamp() makes it fluid between mobile and desktop. */}
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(36px,7vw,64px)', fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1.0, marginBottom: '18px' }}>
            Buy. Sell.<br /><span style={{ color: 'var(--terra)' }}>Find your area.</span>
          </h1>
          <p style={{ fontSize: 'clamp(13px,2vw,16px)', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.8, maxWidth: '520px', marginBottom: '32px' }}>
            A public housing information hub and a verified student marketplace – built exclusively for the UMass community. No strangers, no scams.
          </p>

          {/* Primary CTA buttons – navigate to the two main sections. */}
          <div className="d-flex flex-wrap gap-3 mb-5">
            <button className="btn btn-dark rounded-3 px-4 py-2" style={{ fontSize: '14px' }} onClick={() => navigate('/housing')}>Explore housing areas</button>
            <button className="btn btn-outline-secondary rounded-3 px-4 py-2 bg-white" style={{ fontSize: '14px', borderColor: 'var(--border)', color: 'var(--ink)' }} onClick={() => navigate('/marketplace')}>Browse marketplace</button>
          </div>

          <hr style={{ borderColor: 'var(--sand3)', marginBottom: 'clamp(28px,4vw,40px)' }} />

          {/* Service cards – Housing Hub and Student Marketplace feature tiles.
              Config is defined inline as an array to keep the JSX DRY.          */}
          <div className="row g-3">
            {[
              { to: '/housing', stripe: 'var(--sage)', icon: '🏘️', tag: 'Public · No login needed', title: 'Housing Hub', desc: 'Rent ranges, amenities, floor plans, and PVTA bus routes by neighborhood. A research guide for students apartment hunting.', pillBg: 'var(--sage-bg)', pillColor: 'var(--sage)', pillBd: 'var(--sage-bd)', pillText: 'Open to everyone' },
              { to: '/marketplace', stripe: 'var(--terra)', icon: '🏷️', tag: '@umass.edu required', title: 'Student Marketplace', desc: 'Buy and sell furniture, textbooks, electronics. Track status from Available to In-talk to Sold. Every seller is verified.', pillBg: 'var(--terra-bg)', pillColor: 'var(--terra)', pillBd: 'var(--terra-bd)', pillText: 'Verified students only' },
            ].map(s => (
              <div key={s.title} className="col-12 col-md-6">
                {/* .svc-card applies cursor:pointer + hover lift animation. */}
                <div className="svc-card card border h-100 p-4 position-relative overflow-hidden" style={{ borderRadius: '14px' }} onClick={() => navigate(s.to)}>
                  {/* Coloured accent stripe at the top of the card. */}
                  <div className="svc-stripe" style={{ background: s.stripe }}></div>
                  <div className="d-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: '40px', height: '40px', background: s.pillBg, fontSize: '18px' }}>{s.icon}</div>
                  <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '9px', letterSpacing: '1.5px', color: 'var(--muted)' }}>{s.tag}</div>
                  <div className="fw-bold mb-2" style={{ fontFamily: 'Syne,sans-serif', fontSize: '16px', letterSpacing: '-.3px' }}>{s.title}</div>
                  <p style={{ fontSize: '12px', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.7, marginBottom: '12px' }}>{s.desc}</p>
                  {/* Access-level pill at the bottom of the card. */}
                  <span className="badge rounded-pill px-3 py-2" style={{ background: s.pillBg, color: s.pillColor, border: `1px solid ${s.pillBd}`, fontSize: '10px', fontWeight: 500 }}>{s.pillText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ROW ──────────────────────────────────────────────────────────
          4 equal-width columns with g-0 (no gutter) and border-end dividers.
          The last column uses the conditional class to skip the trailing border. */}
      <div className="bg-white border-top">
        <div className="row g-0">
          {stats.map(([n, l], i) => (
            <div key={l} className={`col-6 col-md-3 py-3 px-4${i < 3 ? ' border-end' : ''}`}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '24px', fontWeight: 800, letterSpacing: '-.8px' }}>{n}</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RECENT LISTINGS ────────────────────────────────────────────────────
          Shows only the first 3 listings (slice(0,3)) as a preview.
          Clicking a card sets selectedItem → opens DetailModal.                 */}
      <div className="py-5 px-4" style={{ background: 'var(--sand)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <div>
              <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '11px', letterSpacing: '1.5px', color: 'var(--muted)' }}>Fresh on the market</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(16px,3vw,22px)', fontWeight: 800, letterSpacing: '-.5px' }}>Recent listings</div>
            </div>
            {/* "View all" navigates to the full Marketplace page. */}
            <button className="btn btn-outline-secondary rounded-3 bg-white" style={{ fontSize: '12px', padding: '9px 18px', borderColor: 'var(--border)', color: 'var(--ink)' }} onClick={() => navigate('/marketplace')}>
              View all →
            </button>
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
            {listings.slice(0, 3).map(item => (
              <div key={item.id} className="col">
                <CardA item={item} onClick={setSelectedItem} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page footer – only appears on the Home page. */}
      <footer>
        <strong>ReLoop UMass</strong> Community · {new Date().getFullYear()}
      </footer>

      {/* DetailModal mounts only when a card has been clicked (selectedItem !== null). */}
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </>
  );
}
