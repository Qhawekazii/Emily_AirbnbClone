/**
 * pages/UpdateListingPage.jsx
 * Pre-fills the listing form with existing data for seamless updates.
 */

import React, { useState, useEffect } from 'react';
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
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Load existing listing data
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
          images: Array.isArray(d.images) ? d.images.join(', ') : '',
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

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Price must be a positive number';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await api.put(`/accommodations/${id}`, {
        ...form,
        amenities: form.amenities,
        images: form.images,
      });
      setSuccess('Listing updated successfully!');
      setTimeout(() => navigate('/listings'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!form) return <div className="container" style={{ padding: 40 }}><div className="alert alert-error">{serverError}</div></div>;

  return (
    <main className="listing-form-page container">
      <div className="listing-form-header">
        <h1>Update Listing</h1>
        <p>Edit the details below and save your changes.</p>
      </div>

      {serverError && <div className="alert alert-error">{serverError}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="listing-form" noValidate>
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

        <div className="form-section">
          <h2>Images</h2>
          <div className="form-group">
            <label htmlFor="images">Image URLs (comma-separated)</label>
            <textarea id="images" name="images" value={form.images} onChange={handleChange} rows={3} />
          </div>
        </div>

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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default UpdateListingPage;
