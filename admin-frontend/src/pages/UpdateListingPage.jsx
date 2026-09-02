/**
 * pages/UpdateListingPage.jsx
 * Pre-fills the listing form with existing data for seamless updates.
 * Supports file upload (multipart/form-data via multer) and URL fallback.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import './ListingForm.css';

const AMENITY_OPTIONS = [
  'WiFi', 'Kitchen', 'Free parking', 'Air conditioning', 'TV',
  'Washer', 'Pool', 'BBQ', 'Garden', 'Breakfast', 'Heating',
  'Elevator', 'Gym', 'Beach access', 'Fireplace',
];

const ACCOMMODATION_TYPES = [
  'Entire apartment', 'Entire house', 'Private room',
  'Shared room', 'Villa', 'Cabin', 'Beach house', 'Cottage',
];

const UpdateListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadMode, setUploadMode] = useState('url'); // default to url (existing images)
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // ── Load existing listing data ──────────────────────────────────────────────
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/accommodations/${id}`);
        const d = res.data;
        setForm({
          title: d.title || '',
          location: d.location || '',
          description: d.description || '',
          type: d.type || 'Entire apartment',
          price: String(d.price || ''),
          guests: String(d.guests || '1'),
          bedrooms: String(d.bedrooms || '0'),
          bathrooms: String(d.bathrooms || '0'),
          weeklyDiscount: String(d.weeklyDiscount || '0'),
          cleaningFee: String(d.cleaningFee || '0'),
          serviceFee: String(d.serviceFee || '0'),
          occupancyTaxes: String(d.occupancyTaxes || '0'),
          host: d.host || '',
          imageUrls: Array.isArray(d.images) ? d.images.join(', ') : '',
          amenities: d.amenities || [],
          enhancedCleaning: d.enhancedCleaning || false,
          selfCheckIn: d.selfCheckIn || false,
        });
      } catch (err) {
        setServerError('Failed to load listing data.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Price must be a positive number';
    return e;
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (files.some((f) => !allowed.includes(f.type))) {
      setErrors((prev) => ({ ...prev, images: 'Only JPEG, PNG, WebP and GIF images allowed' }));
      return;
    }
    if (files.some((f) => f.size > 5 * 1024 * 1024)) {
      setErrors((prev) => ({ ...prev, images: 'Each image must be under 5 MB' }));
      return;
    }
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
    if (errors.images) setErrors((prev) => ({ ...prev, images: '' }));
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      if (uploadMode === 'file' && imageFiles.length > 0) {
        const formData = new FormData();
        Object.entries(form).forEach(([key, val]) => {
          if (key === 'amenities') {
            val.forEach((a) => formData.append('amenities', a));
          } else if (key !== 'imageUrls') {
            formData.append(key, val);
          }
        });
        imageFiles.forEach((file) => formData.append('images', file));
        await api.put(`/accommodations/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.put(`/accommodations/${id}`, {
          ...form,
          amenities: form.amenities,
          images: form.imageUrls,
        });
      }
      setSuccess('Listing updated successfully!');
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setTimeout(() => navigate('/listings'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (fetchLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!form) return (
    <div className="container" style={{ padding: 40 }}>
      <div className="alert alert-error">{serverError}</div>
    </div>
  );

  return (
    <main className="listing-form-page container">
      <div className="listing-form-header">
        <h1>Update Listing</h1>
        <p>Edit the details below and save your changes.</p>
      </div>

      {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}
      {success && <div className="alert alert-success" role="status">{success}</div>}

      <form onSubmit={handleSubmit} className="listing-form" noValidate encType="multipart/form-data">

        {/* ── Basic Info ──────────────────────────────────────────────────── */}
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Property Title *</label>
              <input id="title" name="title" value={form.title} onChange={handleChange}
                className={errors.title ? 'error' : ''} />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input id="location" name="location" value={form.location} onChange={handleChange}
                className={errors.location ? 'error' : ''} />
              {errors.location && <span className="form-error">{errors.location}</span>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" name="description" value={form.description}
              onChange={handleChange} className={errors.description ? 'error' : ''} rows={4} />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Property Type *</label>
              <select id="type" name="type" value={form.type} onChange={handleChange}>
                {ACCOMMODATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="host">Host Name</label>
              <input id="host" name="host" value={form.host} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* ── Capacity ────────────────────────────────────────────────────── */}
        <div className="form-section">
          <h2>Capacity</h2>
          <div className="form-row form-row-4">
            {['guests', 'bedrooms', 'bathrooms'].map((name) => (
              <div className="form-group" key={name}>
                <label htmlFor={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</label>
                <input id={name} name={name} type="number" min="0" value={form[name]} onChange={handleChange} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Pricing ─────────────────────────────────────────────────────── */}
        <div className="form-section">
          <h2>Pricing (USD)</h2>
          <div className="form-row form-row-4">
            {[
              { name: 'price', label: 'Price per Night *' },
              { name: 'cleaningFee', label: 'Cleaning Fee' },
              { name: 'serviceFee', label: 'Service Fee' },
              { name: 'occupancyTaxes', label: 'Occupancy Taxes' },
            ].map(({ name, label }) => (
              <div className="form-group" key={name}>
                <label htmlFor={name}>{label}</label>
                <input id={name} name={name} type="number" min="0" step="0.01"
                  value={form[name]} onChange={handleChange}
                  className={errors[name] ? 'error' : ''} />
                {errors[name] && <span className="form-error">{errors[name]}</span>}
              </div>
            ))}
          </div>
          <div className="form-group" style={{ maxWidth: 240 }}>
            <label htmlFor="weeklyDiscount">Weekly Discount (%)</label>
            <input id="weeklyDiscount" name="weeklyDiscount" type="number" min="0" max="100"
              value={form.weeklyDiscount} onChange={handleChange} />
          </div>
        </div>

        {/* ── Images ──────────────────────────────────────────────────────── */}
        <div className="form-section">
          <h2>Property Images</h2>

          <div className="upload-mode-toggle">
            <button type="button" className={`mode-btn ${uploadMode === 'url' ? 'active' : ''}`}
              onClick={() => setUploadMode('url')}>🔗 Keep / Update URLs</button>
            <button type="button" className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
              onClick={() => setUploadMode('file')}>📁 Upload New Files</button>
          </div>

          {uploadMode === 'url' ? (
            <div className="form-group">
              <label htmlFor="imageUrls">Image URLs (comma-separated)</label>
              <textarea id="imageUrls" name="imageUrls" value={form.imageUrls}
                onChange={handleChange} rows={3} />
            </div>
          ) : (
            <div className="file-upload-area">
              <div
                className="drop-zone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileChange({ target: { files: e.dataTransfer.files } });
                }}
                role="button" tabIndex={0} aria-label="Upload new images"
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <span className="drop-icon" aria-hidden="true">🖼️</span>
                <p><strong>Click to upload</strong> or drag &amp; drop</p>
                <p className="drop-hint">JPEG, PNG, WebP, GIF — max 5 MB each</p>
              </div>
              <input ref={fileInputRef} type="file" name="images"
                accept="image/jpeg,image/png,image/webp,image/gif" multiple
                onChange={handleFileChange} className="sr-only" />
              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="preview-item">
                      <img src={src} alt={`Preview ${i + 1}`} />
                      <button type="button" className="preview-remove"
                        onClick={() => removeImage(i)} aria-label={`Remove image ${i + 1}`}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {errors.images && <span className="form-error">{errors.images}</span>}
        </div>

        {/* ── Amenities ───────────────────────────────────────────────────── */}
        <div className="form-section">
          <h2>Amenities</h2>
          <div className="amenities-grid">
            {AMENITY_OPTIONS.map((a) => (
              <label key={a} className={`amenity-chip ${form.amenities.includes(a) ? 'selected' : ''}`}>
                <input type="checkbox" checked={form.amenities.includes(a)}
                  onChange={() => toggleAmenity(a)} className="sr-only" />
                {a}
              </label>
            ))}
          </div>
        </div>

        {/* ── Features ────────────────────────────────────────────────────── */}
        <div className="form-section">
          <h2>Features</h2>
          <div className="checkbox-row">
            <label className="checkbox-label">
              <input type="checkbox" name="enhancedCleaning" checked={form.enhancedCleaning} onChange={handleChange} />
              Enhanced Cleaning Protocol
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="selfCheckIn" checked={form.selfCheckIn} onChange={handleChange} />
              Self Check-In Available
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/listings')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving...</>
              : 'Save Changes'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default UpdateListingPage;
