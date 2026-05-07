// ── EditHousingModal ──────────────────────────────────────────────────────────
// Lets an admin/seller edit a housing area's data, carousel photos,
// and per-floor-plan images.
//
// Props:
//   h       – the housing object from AppContext.housing
//   onClose – called when the modal should be dismissed

import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const MAX_CAROUSEL = 8;

export default function EditHousingModal({ h, onClose }) {
  const { updateHousing, showToast } = useApp();
  const { token } = useAuth();

  // ── Scalar fields ──────────────────────────────────────────────────────────
  const [name,        setName]        = useState(h.name        ?? '');
  const [type,        setType]        = useState(h.type        ?? '');
  const [description, setDescription] = useState(h.description ?? '');
  const [distance,    setDistance]    = useState(h.distance    ?? '');
  const [rentMin,     setRentMin]     = useState(h.rentMin     ?? '');
  const [rentMax,     setRentMax]     = useState(h.rentMax     ?? '');
  const [amenities,   setAmenities]   = useState((h.amenities  ?? []).join(', '));
  const [busRoutes,   setBusRoutes]   = useState((h.busRoutes  ?? []).join(', '));
  const [mapEmbedUrl, setMapEmbedUrl] = useState(h.mapEmbedUrl ?? '');

  const [contactPhone,   setContactPhone]   = useState(h.contact?.phone   ?? '');
  const [contactEmail,   setContactEmail]   = useState(h.contact?.email   ?? '');
  const [contactWebsite, setContactWebsite] = useState(h.contact?.website ?? '');
  const [contactAddress, setContactAddress] = useState(h.contact?.address ?? '');

  // ── Carousel images ────────────────────────────────────────────────────────
  // existingCarousel: the current { url, key }[] still kept (not removed)
  const [existingCarousel,    setExistingCarousel]    = useState(h.imageUrls ?? []);
  const [removedCarouselKeys, setRemovedCarouselKeys] = useState([]);
  // newCarouselFiles: File[] chosen by user to add
  const [newCarouselFiles,    setNewCarouselFiles]    = useState([]);
  const [newCarouselPreviews, setNewCarouselPreviews] = useState([]);
  const carouselInputRef = useRef(null);

  // ── Floor plans ────────────────────────────────────────────────────────────
  // floorPlans mirrors h.floorPlans but tracks local edits + new image files
  const [floorPlans, setFloorPlans] = useState(
    (h.floorPlans ?? []).map((fp, i) => ({
      index:          i,
      layout:         fp.layout      ?? '',
      sqft:           fp.sqft        ?? '',
      description:    fp.description ?? '',
      imageUrl:       fp.imageUrl    ?? '',
      imageKey:       fp.imageKey    ?? '',
      removeImageKey: null,  // set when user clicks × on existing image
      newFile:        null,  // File chosen to replace / add image
      newPreview:     null,
    }))
  );

  const [loading, setLoading] = useState(false);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Carousel handlers ──────────────────────────────────────────────────────
  function removeExistingCarousel(key) {
    setExistingCarousel(prev => prev.filter(img => img.key !== key));
    setRemovedCarouselKeys(prev => [...prev, key]);
  }

  function removeNewCarousel(idx) {
    setNewCarouselFiles(prev => prev.filter((_, i) => i !== idx));
    setNewCarouselPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  function handleCarouselPick(e) {
    const files = Array.from(e.target.files);
    const totalAfter = existingCarousel.length + newCarouselFiles.length + files.length;
    if (totalAfter > MAX_CAROUSEL) {
      showToast(`Maximum ${MAX_CAROUSEL} carousel images`, '⚠️');
      e.target.value = '';
      return;
    }
    const previews = files.map(f => URL.createObjectURL(f));
    setNewCarouselFiles(prev => [...prev, ...files]);
    setNewCarouselPreviews(prev => [...prev, ...previews]);
    e.target.value = '';
  }

  // ── Floor plan handlers ────────────────────────────────────────────────────
  function updateFP(index, patch) {
    setFloorPlans(prev => prev.map(fp => fp.index === index ? { ...fp, ...patch } : fp));
  }

  function handleFPImagePick(index, file) {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    updateFP(index, { newFile: file, newPreview: preview });
  }

  function removeFPExistingImage(index, key) {
    updateFP(index, { removeImageKey: key, imageUrl: '', imageKey: '' });
  }

  function removeFPNewImage(index) {
    updateFP(index, { newFile: null, newPreview: null });
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { showToast('Name is required', '⚠️'); return; }

    setLoading(true);
    try {
      const fd = new FormData();

      fd.append('name',        name.trim());
      fd.append('type',        type.trim());
      fd.append('description', description.trim());
      fd.append('distance',    distance);
      fd.append('rentMin',     rentMin);
      fd.append('rentMax',     rentMax);
      fd.append('mapEmbedUrl', mapEmbedUrl.trim());
      fd.append('amenities',   JSON.stringify(amenities.split(',').map(s => s.trim()).filter(Boolean)));
      fd.append('busRoutes',   JSON.stringify(busRoutes.split(',').map(s => s.trim()).filter(Boolean)));
      fd.append('contact',     JSON.stringify({
        phone:   contactPhone.trim(),
        email:   contactEmail.trim(),
        website: contactWebsite.trim(),
        address: contactAddress.trim(),
      }));

      // Carousel removals
      if (removedCarouselKeys.length > 0) {
        fd.append('removeCarouselKeys', JSON.stringify(removedCarouselKeys));
      }

      // New carousel files
      for (const file of newCarouselFiles) {
        fd.append('carouselImages', file);
      }

      // Floor plan text updates + image changes
      const fpUpdates = floorPlans.map(fp => ({
        index:          fp.index,
        layout:         fp.layout,
        sqft:           fp.sqft === '' ? null : Number(fp.sqft),
        description:    fp.description,
        ...(fp.removeImageKey ? { removeImageKey: fp.removeImageKey } : {}),
      }));
      fd.append('floorPlanUpdates', JSON.stringify(fpUpdates));

      // New floor plan image files
      for (const fp of floorPlans) {
        if (fp.newFile) {
          fd.append(`floorPlanImage_${fp.index}`, fp.newFile);
        }
      }

      const ok = await updateHousing(h.id ?? h._id, fd);
      if (ok) onClose();
    } finally {
      setLoading(false);
    }
  }

  const totalCarousel = existingCarousel.length + newCarouselFiles.length;

  return (
    <div className="modal fade show d-block" tabIndex="-1"
      style={{ background: 'rgba(24,24,27,.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxHeight: '90vh' }}>
        <div className="modal-content rounded-4 overflow-hidden d-flex flex-column" style={{ maxHeight: '90vh' }}>

          {/* Header */}
          <div className="modal-header border-bottom px-4 py-3">
            <h6 className="modal-title fw-bold mb-0" style={{ fontFamily: 'Syne,sans-serif', letterSpacing: '-.3px' }}>
              Edit: {h.name}
            </h6>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-4" style={{ overflowY: 'auto' }}>
            <form id="edit-housing-form" onSubmit={handleSubmit}>

              {/* ── Basic fields ─────────────────────────────────────────── */}
              <SectionLabel>Basic info</SectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6">
                  <FieldLabel>Name</FieldLabel>
                  <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="col-12 col-sm-6">
                  <FieldLabel>Type</FieldLabel>
                  <input className="form-control" value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Suburban" />
                </div>
                <div className="col-12 col-sm-4">
                  <FieldLabel>Distance (mi)</FieldLabel>
                  <input type="number" step="0.1" className="form-control" value={distance} onChange={e => setDistance(e.target.value)} />
                </div>
                <div className="col-12 col-sm-4">
                  <FieldLabel>Rent min ($/mo)</FieldLabel>
                  <input type="number" className="form-control" value={rentMin} onChange={e => setRentMin(e.target.value)} />
                </div>
                <div className="col-12 col-sm-4">
                  <FieldLabel>Rent max ($/mo)</FieldLabel>
                  <input type="number" className="form-control" value={rentMax} onChange={e => setRentMax(e.target.value)} />
                </div>
                <div className="col-12">
                  <FieldLabel>Description</FieldLabel>
                  <textarea className="form-control" rows={5} value={description} onChange={e => setDescription(e.target.value)} style={{ resize: 'vertical', fontSize: '13px' }} />
                </div>
                <div className="col-12">
                  <FieldLabel>Amenities (comma-separated)</FieldLabel>
                  <input className="form-control" value={amenities} onChange={e => setAmenities(e.target.value)} placeholder="Gym, Pool, Parking" />
                </div>
                <div className="col-12">
                  <FieldLabel>Bus routes (comma-separated)</FieldLabel>
                  <input className="form-control" value={busRoutes} onChange={e => setBusRoutes(e.target.value)} placeholder="#30, #31" />
                </div>
                <div className="col-12">
                  <FieldLabel>Map embed URL</FieldLabel>
                  <input className="form-control" value={mapEmbedUrl} onChange={e => setMapEmbedUrl(e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
                </div>
              </div>

              {/* ── Contact ─────────────────────────────────────────────── */}
              <SectionLabel>Contact info</SectionLabel>
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6">
                  <FieldLabel>Phone</FieldLabel>
                  <input className="form-control" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="(413) 000-0000" />
                </div>
                <div className="col-12 col-sm-6">
                  <FieldLabel>Email</FieldLabel>
                  <input type="email" className="form-control" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                </div>
                <div className="col-12 col-sm-6">
                  <FieldLabel>Website</FieldLabel>
                  <input className="form-control" value={contactWebsite} onChange={e => setContactWebsite(e.target.value)} placeholder="https://..." />
                </div>
                <div className="col-12 col-sm-6">
                  <FieldLabel>Address</FieldLabel>
                  <input className="form-control" value={contactAddress} onChange={e => setContactAddress(e.target.value)} />
                </div>
              </div>

              {/* ── Carousel images ──────────────────────────────────────── */}
              <SectionLabel>Carousel photos ({totalCarousel} / {MAX_CAROUSEL})</SectionLabel>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {/* Existing photos */}
                {existingCarousel.map(img => (
                  <div key={img.key} style={{ position: 'relative', width: '90px', height: '90px' }}>
                    <img src={img.url} alt="" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--sand3)' }} />
                    <button type="button" onClick={() => removeExistingCarousel(img.key)}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}

                {/* New file previews */}
                {newCarouselPreviews.map((src, i) => (
                  <div key={`new-${i}`} style={{ position: 'relative', width: '90px', height: '90px' }}>
                    <img src={src} alt="" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--sage)', opacity: 0.85 }} />
                    <button type="button" onClick={() => removeNewCarousel(i)}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}

                {/* Add button */}
                {totalCarousel < MAX_CAROUSEL && (
                  <button type="button" onClick={() => carouselInputRef.current?.click()}
                    style={{ width: '90px', height: '90px', border: '2px dashed var(--sand3)', borderRadius: '8px', background: 'var(--sand)', color: 'var(--muted)', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                )}
                <input ref={carouselInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleCarouselPick} />
              </div>

              {/* ── Floor plans ──────────────────────────────────────────── */}
              <SectionLabel>Floor plans</SectionLabel>
              <div className="d-flex flex-column gap-3 mb-4">
                {floorPlans.map(fp => (
                  <div key={fp.index} className="p-3 rounded-3" style={{ border: '1px solid var(--sand3)', background: 'var(--sand)' }}>
                    <div className="fw-semibold mb-3" style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Floor plan {fp.index + 1}
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-12 col-sm-5">
                        <FieldLabel>Layout</FieldLabel>
                        <input className="form-control form-control-sm" value={fp.layout} onChange={e => updateFP(fp.index, { layout: e.target.value })} placeholder="2 Bed / 2 Bath" />
                      </div>
                      <div className="col-12 col-sm-3">
                        <FieldLabel>Sqft</FieldLabel>
                        <input type="number" className="form-control form-control-sm" value={fp.sqft} onChange={e => updateFP(fp.index, { sqft: e.target.value })} placeholder="850" />
                      </div>
                      <div className="col-12 col-sm-4">
                        <FieldLabel>Description</FieldLabel>
                        <input className="form-control form-control-sm" value={fp.description} onChange={e => updateFP(fp.index, { description: e.target.value })} placeholder="Optional notes" />
                      </div>
                    </div>

                    {/* Floor plan image */}
                    <FieldLabel>Floor plan image</FieldLabel>
                    <div className="d-flex align-items-center gap-3 mt-1">
                      {/* Show existing image (if not removed) */}
                      {fp.imageUrl && !fp.removeImageKey && (
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img src={fp.imageUrl} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--sand3)' }} />
                          <button type="button" onClick={() => removeFPExistingImage(fp.index, fp.imageKey)}
                            style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                      )}

                      {/* Show new file preview */}
                      {fp.newPreview && (
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img src={fp.newPreview} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '2px solid var(--sage)', opacity: 0.85 }} />
                          <button type="button" onClick={() => removeFPNewImage(fp.index)}
                            style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                      )}

                      {/* File picker */}
                      {!fp.newPreview && (
                        <label style={{ cursor: 'pointer', border: '2px dashed var(--sand3)', borderRadius: '6px', background: '#fff', padding: '8px 14px', fontSize: '12px', color: 'var(--muted)', flexShrink: 0 }}>
                          {fp.imageUrl && !fp.removeImageKey ? 'Replace image' : '+ Upload image'}
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleFPImagePick(fp.index, e.target.files[0]); e.target.value = ''; }} />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </form>
          </div>

          {/* Footer — outside the form so modal-dialog-scrollable works correctly */}
          <div className="modal-footer border-top px-4 py-3 d-flex justify-content-end gap-2" style={{ flexShrink: 0 }}>
            <button type="button" className="btn btn-sm rounded-3 px-4" onClick={onClose} style={{ fontSize: '13px' }}>Cancel</button>
            <button type="submit" form="edit-housing-form" className="btn btn-dark btn-sm rounded-3 px-4" disabled={loading} style={{ fontSize: '13px' }}>
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="text-uppercase fw-semibold mb-2" style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--muted)', borderBottom: '1px solid var(--sand3)', paddingBottom: '6px', marginBottom: '14px' }}>
      {children}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="form-label text-uppercase fw-semibold mb-1" style={{ fontSize: '10px', letterSpacing: '1px', color: 'var(--muted)' }}>
      {children}
    </label>
  );
}
