// ── Marketplace page ──────────────────────────────────────────────────────────
// Verified student buy/sell board at "/marketplace".
// Five independent filters narrow the listings array from AppContext:
//   mktTab      – status tab: all | available | intalk | sold
//   cat         – category pill: all | Furniture | Textbooks | Electronics | …
//   search      – text search across title and description
//   priceFilter – max price ceiling (as a string to match <select> value)
//   condFilter  – exact condition match
//
// All filter state is local; no other page reads these values.
// AppContext supplies the listings array so newly created items appear here
// without a page reload.

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import CardA from '../components/CardA';
import DetailModal from '../components/DetailModal';
import CreateListingModal from '../components/CreateListingModal';

// Category pill definitions: [filterKey, displayLabel].
const CATS = [
  ['all','All items'],['Furniture','🛋️ Furniture'],['Textbooks','📚 Textbooks'],
  ['Electronics','💻 Electronics'],['Clothing','👗 Clothing'],['Appliances','🍳 Appliances'],
  ['Sports','🚴 Sports'],['Other','📦 Other'],
];

// Status tab definitions used in the hero tab bar.
const TABS = [['all','All items'],['available','Available'],['intalk','In-talk'],['sold','Sold']];

export default function Marketplace() {
  // listings from context; includes any items added via CreateListingModal.
  const { listings } = useApp();

  const [cat, setCat] = useState('all');
  const [mktTab, setMktTab] = useState('all');
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [condFilter, setCondFilter] = useState('');

  // selectedItem: null when no detail modal is open.
  const [selectedItem, setSelectedItem] = useState(null);

  // createOpen: controls visibility of the CreateListingModal.
  const [createOpen, setCreateOpen] = useState(false);

  // Derived filtered list – all filters are AND-ed together.
  const list = listings.filter(m => {
    // Category filter – skip if 'all' is selected.
    if (cat !== 'all' && m.cat !== cat) return false;
    // Status tab filter: normalise "In-talk" → "intalk" for comparison.
    if (mktTab !== 'all' && m.status.toLowerCase().replace('-', '') !== mktTab) return false;
    // Text search across title and description (case-insensitive).
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.desc.toLowerCase().includes(search.toLowerCase())) return false;
    // Price ceiling – convert the string filter value to a number for comparison.
    if (priceFilter && m.price > +priceFilter) return false;
    // Condition exact-match.
    if (condFilter && m.cond !== condFilter) return false;
    return true;
  });

  return (
    <>
      {/* ── PAGE HERO ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-bottom" style={{ padding: 'clamp(20px,4vw,36px) clamp(16px,4vw,40px) 0' }}>
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3" style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div>
            {/* Terra dot + eyebrow label. */}
            <div className="d-flex align-items-center gap-2 mb-2">
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--terra)' }}></div>
              <span className="text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1.5px', color: 'var(--terra)' }}>Verified · @umass.edu only</span>
            </div>
            <h4 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, letterSpacing: '-1px', marginBottom: '6px' }}>Student Marketplace</h4>
            <p className="mb-0" style={{ fontSize: '13px', fontWeight: 300, color: 'var(--faint)', lineHeight: 1.7, maxWidth: '520px' }}>
              Buy and sell within the Five College community. Every seller is a verified student.
            </p>
          </div>
          {/* "Create listing" CTA – opens the CreateListingModal. */}
          <button className="btn btn-dark rounded-3 d-flex align-items-center gap-2 mt-2" style={{ fontSize: '13px', padding: '10px 20px', flexShrink: 0 }} onClick={() => setCreateOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></svg>
            Create listing
          </button>
        </div>

        {/* Status tab bar – negative margin expands it to full-bleed. */}
        <div className="ph-tab-bar mt-4" style={{ maxWidth: '1160px', margin: '16px auto 0', padding: '0 clamp(16px,4vw,40px)', marginLeft: 'clamp(-16px,-4vw,-40px)', marginRight: 'clamp(-16px,-4vw,-40px)' }}>
          {TABS.map(([key, label]) => (
            <button key={key} className={`ph-tab${mktTab === key ? ' on' : ''}`} onClick={() => setMktTab(key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── FILTER BAR ────────────────────────────────────────────────────── */}
      <div className="bg-white border-bottom py-2 px-4">
        <div className="d-flex flex-wrap gap-2 align-items-center" style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {/* Full-text search input. */}
          <input className="form-control flex-grow-1" style={{ minWidth: '180px' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🏷️ Search items, brands, categories..." />
          {/* Price ceiling selector. */}
          <select className="form-select w-auto" value={priceFilter} onChange={e => setPriceFilter(e.target.value)}>
            <option value="">Any price</option>
            <option value="25">Under $25</option>
            <option value="100">Under $100</option>
            <option value="500">Under $500</option>
          </select>
          {/* Condition exact-match selector. */}
          <select className="form-select w-auto" value={condFilter} onChange={e => setCondFilter(e.target.value)}>
            <option value="">Any condition</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>
      </div>

      {/* ── CATEGORY PILLS ────────────────────────────────────────────────── */}
      {/* overflow-x-auto allows the pill row to scroll horizontally on mobile. */}
      <div className="bg-white border-bottom py-2 px-4 overflow-x-auto">
        <div className="d-flex gap-2" style={{ maxWidth: '1160px', margin: '0 auto', flexWrap: 'nowrap' }}>
          {CATS.map(([key, label]) => (
            // .cat.on applies the active (ink fill) style.
            <button key={key} className={`cat${cat === key ? ' on' : ''}`} onClick={() => setCat(key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div className="py-4 px-4" style={{ background: 'var(--sand)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {/* Count row – shows filtered result count. */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <span className="text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1.5px', color: 'var(--muted)' }}>{list.length} items</span>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Available · In-talk · Sold</span>
          </div>

          {/* Card grid or empty state. */}
          {list.length ? (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
              {list.map(item => (
                <div key={item.id} className="col">
                  {/* Clicking a card sets selectedItem → opens DetailModal. */}
                  <CardA item={item} onClick={setSelectedItem} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏷️</div>
              <div className="fw-bold mb-2" style={{ fontFamily: 'Syne,sans-serif', fontSize: '16px' }}>No items found</div>
              <p style={{ fontSize: '13px', fontWeight: 300, color: 'var(--muted)' }}>Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals – each mounts only when its trigger state is non-null/true. */}
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {createOpen && <CreateListingModal onClose={() => setCreateOpen(false)} />}
    </>
  );
}
