// ── Create listing modal ──────────────────────────────────────────────────────
// Controlled form that lets a verified student post a new marketplace item.
// Opened by the "Create listing" button in the Marketplace page hero.
//
// Props:
//   onClose – closes the modal (clears createOpen state in Marketplace.jsx)
//
// On submit:
//   1. Validates that title and price are filled in.
//   2. Calls AppContext.addListing() to prepend the new item to the global
//      listings array so it appears immediately in the Marketplace grid.
//   3. Fires a success toast and calls onClose().
//
// All form fields are controlled (value + onChange) to keep React as the
// single source of truth and enable straightforward validation.

import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { EMOJI } from '../data/constants';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const CATEGORIES = ['Furniture', 'Textbooks', 'Electronics', 'Clothing', 'Appliances', 'Sports', 'Other'];

export default function CreateListingModal({ onClose }) {
  const { addListing, showToast } = useApp();

  // Controlled form state.
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('Furniture'); // default to first category
  const [price, setPrice] = useState('');
  const [cond, setCond] = useState('New');     // default to best condition
  const [desc, setDesc] = useState('');

  // Lock body scroll while the modal is open; restore on unmount.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function submit() {
    // Basic validation – title and price are the minimum required fields.
    if (!title.trim() || !price) {
      showToast('Please fill in title & price', '⚠️');
      return;
    }

    // Build the new listing object that matches the shape used by CardA/DetailModal.
    addListing({
      id: Date.now(),             // temporary ID; real ID will come from MongoDB
      emoji: EMOJI[cat] || '📦', // map category to its display emoji
      cat,
      title: title.trim(),
      price: +price,              // convert string to number
      cond,
      status: 'Available',        // all new listings start as Available
      desc: desc || 'No description provided.',
      seller: 'John Doe',         // hardcoded until auth is implemented
      init: 'JD',
      rating: 5.0,
      tags: [cat, cond],
      posted: 'Just now',
      ownedByUser: true,          // flag so Profile page knows this belongs to the current user
    });

    showToast('Listing posted!', '🎉');
    onClose();
  }

  return (
    // Backdrop – clicking outside the dialog closes the modal.
    <div className="modal fade show d-block" tabIndex="-1"
      style={{ background: 'rgba(24,24,27,.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content rounded-4">

          {/* Modal header – title + Bootstrap close button. */}
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <h5 className="modal-title fw-bold m-0" style={{ fontFamily: 'Syne,sans-serif', letterSpacing: '-.4px' }}>
              Create a listing
            </h5>
            {/* Bootstrap's built-in .btn-close renders an × icon. */}
            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* Modal body – the actual form. */}
          <div className="modal-body px-4 pb-4 pt-3 d-flex flex-column gap-3">

            {/* Title field. */}
            <div>
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Item title</label>
              <input className="form-control" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. IKEA KALLAX Shelf – White" />
            </div>

            {/* Category + Price in a two-column row. */}
            <div className="row g-3">
              <div className="col">
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Category</label>
                <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col">
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Price ($)</label>
                <input className="form-control" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" />
              </div>
            </div>

            {/* Condition selector – pill buttons instead of a dropdown for easier UX. */}
            <div>
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Condition</label>
              <div className="d-flex flex-wrap gap-2">
                {/* .cond-opt.on highlights the selected pill; click switches selection. */}
                {CONDITIONS.map(c => (
                  <span key={c} className={`cond-opt${cond === c ? ' on' : ''}`} onClick={() => setCond(c)}>{c}</span>
                ))}
              </div>
            </div>

            {/* Description textarea – optional (falls back to default string in submit). */}
            <div>
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Description</label>
              <textarea className="form-control" rows={3} value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Describe the item – condition details, dimensions, why you're selling..." />
            </div>

            {/* Photo upload zone – UI only; upload functionality pending backend. */}
            <div>
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Photos</label>
              <div className="upload-zone">
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>📷</div>
                <div style={{ fontSize: '12px', fontWeight: 300, color: 'var(--muted)' }}>Click to upload · JPG or PNG · up to 10MB</div>
              </div>
            </div>

            {/* Submit button – calls submit() which validates, adds listing, and closes. */}
            <button className="btn btn-dark w-100 rounded-3 py-3" style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '14px' }} onClick={submit}>
              🎉 Post listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
