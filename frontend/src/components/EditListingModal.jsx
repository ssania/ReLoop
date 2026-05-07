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
import { useAuth } from '../context/AuthContext';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const CATEGORIES = ['Furniture', 'Textbooks', 'Electronics', 'Clothing', 'Appliances', 'Sports', 'Other'];
const STATUSES   = ['Available', 'In-talk', 'Sold'];

const API = import.meta.env.VITE_API_URL;

export default function EditListingModal({ item, onClose }) {
  const { updateListing, showToast } = useApp();
  const { token } = useAuth();

  const [title, setTitle]           = useState(item.title);
  const [category, setCategory]     = useState(item.category);
  const [price, setPrice]           = useState(String(item.price));
  const [condition, setCondition]   = useState(item.condition);
  const [status, setStatus]         = useState(item.status);
  const [description, setDescription] = useState(item.description);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [loading, setLoading]       = useState(false);

  // Existing images — starts from what the listing currently has
  const [existingImages, setExistingImages] = useState(item.imageUrls || []);
  // Keys of existing images the seller wants removed
  const [removeKeys, setRemoveKeys]         = useState([]);
  // New image files selected by the seller
  const [newFiles, setNewFiles]             = useState([]);
  // Preview URLs for newly selected files
  const [newPreviews, setNewPreviews]       = useState([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleNewFiles(e) {
    const files = Array.from(e.target.files);
    const total = existingImages.length - removeKeys.length + newFiles.length + files.length;
    if (total > 5) {
      showToast('Maximum 5 images per listing', '⚠️');
      return;
    }
    setNewFiles(prev => [...prev, ...files]);
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  }

  function removeExisting(key) {
    setRemoveKeys(prev => [...prev, key]);
  }

  function removeNew(index) {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  }

  const visibleExisting = existingImages.filter(img => !removeKeys.includes(img.key));
  const totalImages = visibleExisting.length + newFiles.length;

  async function save() {
    if (!title.trim() || !price) {
      showToast('Title and price are required', '⚠️');
      return;
    }

    setLoading(true);
    try {
      // When seller picks Sold, nominate a buyer first
      if (status === 'Sold') {
        if (!buyerEmail.trim()) {
          showToast('Enter the buyer\'s ReLoop email to mark as Sold', '⚠️');
          setLoading(false);
          return;
        }
        const nomRes = await fetch(`${API}/listings/${item.id}/nominate`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ buyerEmail: buyerEmail.trim() }),
        });
        const nomData = await nomRes.json();
        if (!nomRes.ok) {
          showToast(nomData.message || 'Could not nominate buyer', '⚠️');
          setLoading(false);
          return;
        }
      }

      // Send update as multipart so new images can be included
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('price', +price);
      formData.append('condition', condition);
      formData.append('status', status);
      formData.append('description', description || 'No description provided.');
      formData.append('tags', JSON.stringify([category, condition]));

      if (removeKeys.length > 0) {
        formData.append('removeImageKeys', JSON.stringify(removeKeys));
      }
      newFiles.forEach(f => formData.append('images', f));

      const res = await fetch(`${API}/listings/${item.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Could not update listing', '⚠️');
        return;
      }

      updateListing(item.id, data);
      showToast(status === 'Sold' ? 'Buyer notified — awaiting their confirmation' : 'Listing updated!', status === 'Sold' ? '📧' : '✏️');
      onClose();
    } catch {
      showToast('Could not update listing', '⚠️');
    } finally {
      setLoading(false);
    }
  }

  return (
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

            {/* Status pills */}
            <div>
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Status</label>
              <div className="d-flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <span key={s} className={`cond-opt${status === s ? ' on' : ''}`} onClick={() => setStatus(s)}>{s}</span>
                ))}
              </div>
            </div>

            {/* Buyer email — only shown when seller picks Sold */}
            {status === 'Sold' && (
              <div>
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>
                  Buyer's ReLoop email
                </label>
                <input
                  className="form-control"
                  type="email"
                  placeholder="buyer@umass.edu"
                  value={buyerEmail}
                  onChange={e => setBuyerEmail(e.target.value)}
                />
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                  The buyer will receive an email to confirm or reject the purchase.
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>Description</label>
              <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            {/* Photos */}
            <div>
              <label className="form-label text-uppercase fw-semibold d-flex justify-content-between" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--muted)' }}>
                <span>Photos</span>
                <span>{totalImages} / 5</span>
              </label>

              <div className="d-flex flex-wrap gap-2">
                {/* Existing images */}
                {visibleExisting.map(img => (
                  <div key={img.key} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img
                      src={img.url}
                      alt=""
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExisting(img.key)}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#ef4444', color: '#fff', border: 'none',
                        fontSize: 12, lineHeight: '20px', textAlign: 'center',
                        cursor: 'pointer', padding: 0,
                      }}
                    >×</button>
                  </div>
                ))}

                {/* New image previews */}
                {newPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img
                      src={src}
                      alt=""
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeNew(i)}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#ef4444', color: '#fff', border: 'none',
                        fontSize: 12, lineHeight: '20px', textAlign: 'center',
                        cursor: 'pointer', padding: 0,
                      }}
                    >×</button>
                  </div>
                ))}

                {/* Add photos button */}
                {totalImages < 5 && (
                  <label style={{
                    width: 80, height: 80, borderRadius: 8,
                    border: '2px dashed #d1d5db', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#9ca3af', fontSize: 24,
                  }}>
                    +
                    <input type="file" accept="image/*" multiple hidden onChange={handleNewFiles} />
                  </label>
                )}
              </div>
            </div>

            {/* Save button */}
            <button
              className="btn btn-dark w-100 rounded-3 py-3"
              style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '14px' }}
              onClick={save}
              disabled={loading}
            >
              {loading ? 'Saving…' : status === 'Sold' ? 'Notify buyer' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
