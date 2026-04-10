// ── Housing neighbourhood card ────────────────────────────────────────────────
// Purely presentational card used in the Housing page grid.
// Clicking the card calls onClick(h), which the Housing page uses to set
// selectedH and open HousingDetailModal.
//
// Props:
//   h       – a housing object from AppContext.housing (fetched from GET /api/housing)
//   onClick – parent callback; receives the full housing object

export default function HousingCard({ h, onClick }) {
  return (
    <div className="hcard card border h-100" onClick={() => onClick(h)}>

      {/* ── Image / hero area ── */}
      <div className="position-relative d-flex align-items-center justify-content-center overflow-hidden"
        style={{ height: '150px', background: 'linear-gradient(135deg,#e8f0f5,#ccdcec)' }}>

        {/* Property-type pill badge in the top-left (e.g. "Downtown", "Houses"). */}
        <span className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded-pill bg-white border"
          style={{ fontSize: '9px', fontWeight: 600, color: 'var(--sage)', letterSpacing: '.5px' }}>
          {h.type}
        </span>

        {/* Large neighbourhood emoji as the card's visual. */}
        <div style={{ fontSize: '3rem' }}>{h.emoji}</div>
      </div>

      {/* ── Card body ── */}
      <div className="card-body p-3">
        {/* Neighbourhood name. */}
        <div className="fw-bold mb-1" style={{ fontFamily: 'Syne,sans-serif', fontSize: '15px', letterSpacing: '-.3px' }}>{h.name}</div>
        {/* Distance from UMass campus. */}
        <div className="mb-3" style={{ fontSize: '10px', fontWeight: 300, color: 'var(--muted)' }}>{h.dist}</div>

        {/* Rent range label + figures. */}
        <div className="text-uppercase fw-semibold mb-1" style={{ fontSize: '8px', letterSpacing: '1.5px', color: 'var(--muted)' }}>
          Typical rent range
        </div>
        <div className="mb-2">
          <span style={{ fontFamily: 'Syne,sans-serif', fontSize: '19px', fontWeight: 800, letterSpacing: '-.5px' }}>
            ${h.rentMin.toLocaleString()} – ${h.rentMax.toLocaleString()}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 300, color: 'var(--muted)', marginLeft: '3px' }}>/mo</span>
        </div>

        {/* Bus route chips + first two amenity chips.
            .hchip.bus applies the sage-green colour for transit tags. */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          {h.bus.map(b => <span key={b} className="hchip bus">{b}</span>)}
          {h.amenities.slice(0, 2).map(a => <span key={a} className="hchip">{a}</span>)}
        </div>

        {/* Footer row: star rating + walk time. */}
        <div className="d-flex align-items-center justify-content-between pt-2 border-top" style={{ borderColor: 'var(--sand2)!important' }}>
          <span style={{ fontSize: '11px', color: 'var(--faint)' }}>⭐ {h.rating.toFixed(1)} ({h.reviews})</span>
          <span className="hchip">{h.walk}</span>
        </div>
      </div>
    </div>
  );
}
