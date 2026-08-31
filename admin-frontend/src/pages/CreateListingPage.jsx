/**
 * pages/CreateListingPage.jsx
 * Form to create a new property listing.
 * Includes full validation, image URL input, and amenity selection.
 */

import React, { useState } from 'react';
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
  host: '', images: '', amenities: [], enhancedCleaning: false, selfCheckIn: false,
};

const CreateListingPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Price must be a positive number';
    if (!form.guests || Number(form.guests) < 1) e.guests = 'At least 1 guest required';
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
      await api.post('/accommodations', {
        ...form,
        amenities: form.amenities,
        images: form.images,
      });
      setSuccess('Listing created successfully!');
      setTimeout(() => navigate('/listings'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="listing-form-page container">
      <div className="listing-form-header">
        <h1>Create New Listing</h1>
        <p>Fill in the details below to add a new property.</p>
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
            <textarea id="images" name="images" value={form.images} onChange={handleChange} rows={3}
              placeholder="https://images.unsplash.com/photo-xxx, https://..." />
            <small className="form-hint">Paste full image URLs separated by commas</small>
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
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateListingPage;
