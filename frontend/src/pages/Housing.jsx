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
            // Map placeholder – decorative static map with pin elements.
            // Full Google Maps embed is planned for the live version.
            <div className="rounded-4 position-relative d-flex align-items-center justify-content-center overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#e8f0e8,#d0e0d0)', height: '400px', border: '1px solid var(--sage-bd)' }}>
              {/* Four neighbourhood pins at hardcoded positions. */}
              <div className="hdm-map-pin" style={{ top: '35%', left: '38%' }}></div>
              <div className="hdm-map-pin umass" style={{ top: '50%', left: '55%' }}></div>
              <div className="hdm-map-pin" style={{ top: '25%', left: '58%' }}></div>
              <div className="hdm-map-pin" style={{ top: '65%', left: '30%' }}></div>
              <div className="text-center p-3 rounded-3" style={{ background: 'rgba(255,255,255,.85)' }}>
                <div className="fw-medium" style={{ fontSize: '13px', color: 'var(--sage)' }}>🗺️ Interactive map</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>Google Maps integration – click a pin to explore</div>
              </div>
              {/* Legend. */}
              <div className="position-absolute bottom-0 start-0 m-3 p-2 rounded-2 bg-white" style={{ fontSize: '10px' }}>
                <div className="d-flex align-items-center gap-2 mb-1"><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--terra)' }}></div>Neighborhood</div>
                <div className="d-flex align-items-center gap-2"><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sage)' }}></div>UMass / Landmark</div>
              </div>
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
