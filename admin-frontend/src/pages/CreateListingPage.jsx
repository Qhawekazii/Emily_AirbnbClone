/**
 * pages/CreateListingPage.jsx
 * Form to create a new property listing.
 * Supports both file upload (multipart/form-data via multer) and
 * fallback URL input. Includes full validation and amenity selection.
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const initialState = {
  title: '', location: '', description: '', type: 'Entire apartment',
  price: '', guests: '1', bedrooms: '1', bathrooms: '1',
  weeklyDiscount: '0', cleaningFee: '0', serviceFee: '0', occupancyTaxes: '0',
  host: '', imageUrls: '', amenities: [], enhancedCleaning: false, selfCheckIn: false,
};

const CreateListingPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(initialState);
  const [imageFiles, setImageFiles] = useState([]); // actual File objects
  const [imagePreviews, setImagePreviews] = useState([]); // preview URLs
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Price must be a positive number';
    if (!form.guests || Number(form.guests) < 1) e.guests = 'At least 1 guest required';
    if (uploadMode === 'file' && imageFiles.length === 0 && !form.imageUrls.trim()) {
      e.images = 'Please upload at least one image or provide an image URL';
    }
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
    if (files.length === 0) return;

    // Validate file types client-side
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalid = files.filter((f) => !allowed.includes(f.type));
    if (invalid.length > 0) {
      setErrors((prev) => ({ ...prev, images: 'Only JPEG, PNG, WebP and GIF images are allowed' }));
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
      let response;

      if (uploadMode === 'file' && imageFiles.length > 0) {
        // Use multipart/form-data so multer can handle the files
        const formData = new FormData();
        Object.entries(form).forEach(([key, val]) => {
          if (key === 'amenities') {
            val.forEach((a) => formData.append('amenities', a));
          } else if (key !== 'imageUrls') {
            formData.append(key, val);
          }
        });
        imageFiles.forEach((file) => formData.append('images', file));

        response = await api.post('/accommodations', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // JSON mode with URL strings
        response = await api.post('/accommodations', {
          ...form,
          amenities: form.amenities,
          images: form.imageUrls,
        });
      }

      setSuccess('Listing created successfully!');
      // Clean up object URLs
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setTimeout(() => navigate('/listings'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="listing-form-page container">
      <div className="listing-form-header">
        <h1>Create New Listing</h1>
        <p>Fill in the details below to add a new property.</p>
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
                className={errors.title ? 'error' : ''} placeholder="e.g. Modern Apartment in New York" />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input id="location" name="location" value={form.location} onChange={handleChange}
                className={errors.location ? 'error' : ''} placeholder="e.g. New York" />
              {errors.location && <span className="form-error">{errors.location}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange}
              className={errors.description ? 'error' : ''} rows={4}
              placeholder="Describe your property in detail..." />
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
              <input id="host" name="host" value={form.host} onChange={handleChange} placeholder="Your name" />
            </div>
          </div>
        </div>

        {/* ── Capacity ────────────────────────────────────────────────────── */}
        <div className="form-section">
          <h2>Capacity</h2>
          <div className="form-row form-row-4">
            {[
              { name: 'guests', label: 'Max Guests', min: 1 },
              { name: 'bedrooms', label: 'Bedrooms', min: 0 },
              { name: 'bathrooms', label: 'Bathrooms', min: 0 },
            ].map(({ name, label, min }) => (
              <div className="form-group" key={name}>
                <label htmlFor={name}>{label}</label>
                <input id={name} name={name} type="number" min={min}
                  value={form[name]} onChange={handleChange}
                  className={errors[name] ? 'error' : ''} />
                {errors[name] && <span className="form-error">{errors[name]}</span>}
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

          {/* Toggle between file upload and URL */}
          <div className="upload-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
              onClick={() => setUploadMode('file')}
            >
              📁 Upload Files
            </button>
            <button
              type="button"
              className={`mode-btn ${uploadMode === 'url' ? 'active' : ''}`}
              onClick={() => setUploadMode('url')}
            >
              🔗 Use URLs
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div className="file-upload-area">
              {/* Drop zone / file input */}
              <div
                className="drop-zone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dt = { target: { files: e.dataTransfer.files } };
                  handleFileChange(dt);
                }}
                role="button"
                tabIndex={0}
                aria-label="Click or drag images here to upload"
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <span className="drop-icon" aria-hidden="true">🖼️</span>
                <p><strong>Click to upload</strong> or drag &amp; drop</p>
                <p className="drop-hint">JPEG, PNG, WebP, GIF — max 5 MB each, up to 10 images</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                name="images"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileChange}
                className="sr-only"
                aria-label="Upload property images"
              />

              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="image-previews" aria-label="Selected images">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="preview-item">
                      <img src={src} alt={`Preview ${i + 1}`} />
                      <button
                        type="button"
                        className="preview-remove"
                        onClick={() => removeImage(i)}
                        aria-label={`Remove image ${i + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="imageUrls">Image URLs (comma-separated)</label>
              <textarea id="imageUrls" name="imageUrls" value={form.imageUrls} onChange={handleChange}
                rows={3} placeholder="https://images.unsplash.com/photo-xxx, https://..." />
              <small className="form-hint">Paste full image URLs separated by commas</small>
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
              ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating...</>
              : 'Create Listing'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateListingPage;
