// ── Edit listing modal ─────────────────────────────────────────────────────────
// Lets the current user edit a listing they own.
// Pre-fills all fields from the existing listing object, so the user only
// needs to change what they want to update.
//
// Props:
//   item    – the listing object to edit (must have ownedByUser: true)
//   onClose – closes the modal in Profile.jsx

import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const CATEGORIES = ['Furniture', 'Textbooks', 'Electronics', 'Clothing', 'Appliances', 'Sports', 'Other'];
const STATUSES = ['Available', 'In-talk', 'Sold'];

export default function EditListingModal({ item, onClose }) {
  const { updateListing, showToast } = useApp();

  // Pre-fill all fields from the existing listing.
  const [title, setTitle]         = useState(item.title);
  const [category, setCategory]   = useState(item.category);
  const [price, setPrice]         = useState(String(item.price));
  const [condition, setCondition] = useState(item.condition);
  const [status, setStatus]       = useState(item.status);
  const [description, setDescription] = useState(item.description);

  // Lock body scroll while modal is open; restore on unmount.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function save() {
    if (!title.trim() || !price) {
      showToast('Title and price are required', '⚠️');
      return;
    }

    // Push the changed fields into global state via context.
    // ownedByUser is preserved from the original item (not overwritten here).
    updateListing(item.id, {
      title: title.trim(),
      category,
      price: +price,
      condition,
      status,
      description: description || 'No description provided.',
      tags: [category, condition],
    });

    showToast('Listing updated!', '✏️');
    onClose();
  }

  return (
    // Backdrop — click outside dialog to close.
    <div className="modal fade show d-block" tabIndex="-1"
      style={{ background: 'rgba(24,24,27,.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content rounded-4">

          {/* Header */}
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <h5 className="modal-title fw-bold m-0" style={{ fontFamily: 'Syne,sans-serif', letterSpacing: '-.4px' }}>
              Edit listing
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body px-4 pb-4 pt-3 d-flex flex-column gap-3">

            {/* Title */}
            <div>
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Item title</label>
              <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            {/* Category + Price */}
            <div className="row g-3">
              <div className="col">
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Category</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col">
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Price ($)</label>
                <input className="form-control" type="number" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
            </div>

            {/* Condition pills */}
            <div>
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Condition</label>
              <div className="d-flex flex-wrap gap-2">
                {CONDITIONS.map(c => (
                  <span key={c} className={`cond-opt${condition === c ? ' on' : ''}`} onClick={() => setCondition(c)}>{c}</span>
                ))}
              </div>
            </div>

            {/* Status — lets the seller mark as In-talk or Sold */}
            <div>
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Status</label>
              <div className="d-flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <span key={s} className={`cond-opt${status === s ? ' on' : ''}`} onClick={() => setStatus(s)}>{s}</span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Description</label>
              <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            {/* Save button */}
            <button className="btn btn-dark w-100 rounded-3 py-3" style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '14px' }} onClick={save}>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
