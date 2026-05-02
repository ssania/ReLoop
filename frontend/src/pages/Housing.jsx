// ── Housing page ──────────────────────────────────────────────────────────────
// Public neighbourhood research hub at "/housing".
// No login required – purely informational.
//
// Features:
//   • Four filter tabs: All areas / Close to campus / Budget friendly / Map view
//   • Search input: filters by neighbourhood name or description
//   • Rent filter:  hides areas whose rentMin exceeds the selected ceiling
//   • Bus filter:   hides areas that don't serve the selected PVTA route
//   • Map view tab: replaces the card grid with a decorative placeholder map
//   • Clicking a card opens HousingDetailModal
//
// All filter state is local to this page because no other page needs it.

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import HousingCard from '../components/HousingCard';
import HousingDetailModal from '../components/HousingDetailModal';

// Tab definitions: [key, label].
// 'map' is special – it renders the map placeholder instead of the card grid.
const TABS = [['all', 'All areas'], ['close', 'Close to campus'], ['budget', 'Budget friendly'], ['map', 'Map view']];

export default function Housing() {
  const { housing } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [rentFilter, setRentFilter] = useState('');
  const [busFilter, setBusFilter] = useState('');

  // selectedH: null when no modal is open; set to a housing object to open HousingDetailModal.
  const [selectedH, setSelectedH] = useState(null);

  // isMap: true when the "Map view" tab is active.
  // In map view the grid is replaced by the placeholder map; filters still apply
  // to the count display but not to the map itself.
  const isMap = activeTab === 'map';

  // Derived list: apply all active filters to the housing array.
  const list = housing.filter(h => {
    // "Close to campus" tab: rentMin threshold acts as a proxy for proximity.
    if (activeTab === 'close' && h.rentMin > 1200) return false;
    // "Budget friendly" tab: only show the most affordable areas.
    if (activeTab === 'budget' && h.rentMin > 950) return false;
    // Text search: case-insensitive match against name and description.
    if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !h.description.toLowerCase().includes(search.toLowerCase())) return false;
    // Rent filter: hide areas whose starting rent exceeds the selected ceiling.
    if (rentFilter && h.rentMin > +rentFilter) return false;
    // Bus filter: check if any of the area's bus routes contain the route number.
    if (busFilter && !h.busRoutes.some(b => b.includes('#' + busFilter))) return false;
    return true;
  });

  return (
    <>
      {/* ── PAGE HERO ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-bottom" style={{ padding: 'clamp(20px,4vw,36px) clamp(16px,4vw,40px) 0' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {/* Sage dot + eyebrow label. */}
          <div className="d-flex align-items-center gap-2 mb-2">
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--sage)' }}></div>
            <span className="text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1.5px', color: 'var(--sage)' }}>Housing Information Hub</span>
          </div>
          <h4 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, letterSpacing: '-1px', marginBottom: '6px' }}>Neighborhoods Near UMass</h4>
          <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.7, maxWidth: '520px', marginBottom: '20px' }}>
            Explore rent ranges, floor plans, amenities, and PVTA bus routes by locality. A research guide – not a property listings board.
          </p>
          {/* Tab bar at the bottom of the hero. */}
          <div className="ph-tab-bar" style={{ margin: '0 clamp(-16px,-4vw,-40px)', padding: '0 clamp(16px,4vw,40px)' }}>
            {TABS.map(([key, label]) => (
              <button key={key} className={`ph-tab${activeTab === key ? ' on' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ────────────────────────────────────────────────────── */}
      <div className="bg-white border-bottom py-2 px-4">
        <div className="d-flex flex-wrap gap-2 align-items-center" style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {/* Text search. */}
          <input className="form-control flex-grow-1" style={{ minWidth: '180px' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🏠 Search neighborhoods, streets..." />
          {/* Rent ceiling dropdown. */}
          <select className="form-select w-auto" value={rentFilter} onChange={e => setRentFilter(e.target.value)}>
            <option value="">Any rent</option>
            <option value="900">Under $900/mo</option>
            <option value="1400">Under $1,400/mo</option>
            <option value="2000">Under $2,000/mo</option>
          </select>
          {/* PVTA bus route filter. */}
          <select className="form-select w-auto" value={busFilter} onChange={e => setBusFilter(e.target.value)}>
            <option value="">Any bus</option>
            <option value="30">PVTA #30</option>
            <option value="31">PVTA #31</option>
            <option value="33">PVTA #33</option>
            <option value="45">PVTA #45</option>
          </select>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div className="py-4 px-4" style={{ background: 'var(--sand)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {/* Result count – always shows total housing count in map view so the
              filters don't affect the map's count label.                        */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <span className="text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1.5px', color: 'var(--muted)' }}>
              {isMap ? housing.length : list.length} localities
            </span>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Rent ranges · amenities · bus routes · reviews</span>
          </div>

          {/* Conditional rendering: map view vs. card grid vs. empty state. */}
          {isMap ? (
            <div className="rounded-4 overflow-hidden" style={{ border: '1px solid var(--sage-bd)', height: 'clamp(320px, 60vw, 560px)' }}>
              <iframe
                src="https://www.google.com/maps/d/u/2/embed?mid=1-7NpzrhOpkdd8txIGiWzG0sX9-DbT2Q&ehbc=2E312F"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="UMass Amherst neighborhoods map"
              />
            </div>
          ) : list.length ? (
            // Card grid – responsive columns: 1 on mobile, 2 on sm, 3 on xl.
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
              {list.map(h => (
                <div key={h.id} className="col">
                  {/* Clicking a card sets selectedH → opens HousingDetailModal. */}
                  <HousingCard h={h} onClick={setSelectedH} />
                </div>
              ))}
            </div>
          ) : (
            // Empty state when all filters produce zero results.
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏘️</div>
              <div className="fw-bold mb-2" style={{ fontFamily: 'Syne,sans-serif', fontSize: '16px' }}>No areas found</div>
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)' }}>Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* HousingDetailModal mounts only when selectedH is not null. */}
      {selectedH && <HousingDetailModal h={selectedH} onClose={() => setSelectedH(null)} />}
    </>
  );
}
