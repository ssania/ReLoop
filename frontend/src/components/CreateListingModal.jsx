// ── Create listing modal ──────────────────────────────────────────────────────
// Controlled form that lets a verified student post a new marketplace item.
// Opened by the "Create listing" button in the Profile page.
//
// Props:
//   onClose      – closes the modal
//   redirectTo   – optional path to navigate to after a successful submit
//                  (e.g. '/profile'). When omitted, stays on the current page.
//
// On submit:
//   1. Validates that title and price are filled in.
//   2. Calls AppContext.addListing() to prepend the new item to the global
//      listings array so it appears immediately in any grid.
//   3. Fires a success toast, calls onClose(), then navigates to redirectTo.
//
// All form fields are controlled (value + onChange) to keep React as the
// single source of truth and enable straightforward validation.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { EMOJI } from '../data/constants';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const CATEGORIES = ['Furniture', 'Textbooks', 'Electronics', 'Clothing', 'Appliances', 'Sports', 'Other'];
  

export default function CreateListingModal({ onClose, redirectTo }) {
  const { addListing, showToast } = useApp();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  // Controlled form state.
  const [title, setTitle]             = useState('');
  const [category, setCategory]       = useState('Furniture');
  const [price, setPrice]             = useState('');
  const [condition, setCondition]     = useState('New');
  const [description, setDescription] = useState('');

  // Lock body scroll while the modal is open; restore on unmount.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function submit() {
  if (!title.trim() || !price) {
    showToast('Please fill in title & price', '⚠️');
    return;
  }

  try {
    const formData = new FormData();

    formData.append('title', title.trim());
    formData.append('description', description || 'No description provided.');
    formData.append('category', category);
    formData.append('price', +price);
    formData.append('condition', condition);
    formData.append('status', 'Available');

    // ✅ Add images
    images.forEach(img => formData.append('images', img));

    const res = await fetch(`${import.meta.env.VITE_API_URL}/listings`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) throw new Error('Failed to create listing');

    const newListing = await res.json();

    addListing({
      ...newListing,
      emoji: EMOJI[category] || '📦',
    });

    showToast('Listing posted!', '🎉');
    onClose();
    if (redirectTo) navigate(redirectTo);

  } catch (err) {
    console.error(err);
    showToast('Could not post listing. Try again.', '❌');
  }
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
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
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
                  <span key={c} className={`cond-opt${condition === c ? ' on' : ''}`} onClick={() => setCondition(c)}>{c}</span>
                ))}
              </div>
            </div>

            {/* Description textarea – optional (falls back to default string in submit). */}
            <div>
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Description</label>
              <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe the item – condition details, dimensions, why you're selling..." />
            </div>

            {/* Photo upload */}
<div>
  <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>
    Photos (up to 5)
  </label>
  <input
    type="file"
    className="form-control"
    accept="image/*"
    multiple
    onChange={e => setImages(Array.from(e.target.files))}
  />
  {/* Preview selected images */}
  {images.length > 0 && (
    <div className="d-flex flex-wrap gap-2 mt-2">
      {images.map((img, i) => (
        <div key={i} style={{ fontSize: '12px', color: 'var(--muted)' }}>
          📷 {img.name}
        </div>
      ))}
    </div>
  )}
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
