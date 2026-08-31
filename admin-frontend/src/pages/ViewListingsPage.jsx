/**
 * pages/ViewListingsPage.jsx
 * Displays all property listings with options to update or delete each.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './ViewListingsPage.css';

const ViewListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id to confirm
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/accommodations');
      const data = Array.isArray(res.data) ? res.data : (res.data.accommodations || []);
      setListings(data);
    } catch (err) {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/accommodations/${id}`);
      setListings((prev) => prev.filter((l) => l._id !== id));
      setSuccessMsg('Listing deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <main className="view-listings container">
      <div className="listings-header">
        <div>
          <h1>Property Listings</h1>
          <p>{listings.length} listing{listings.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/listings/create" className="btn btn-primary">+ Add Listing</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <p>🏠</p>
          <h3>No listings yet</h3>
          <p>Create your first listing to get started.</p>
          <Link to="/listings/create" className="btn btn-primary" style={{ marginTop: 16 }}>Create Listing</Link>
        </div>
      ) : (
        <div className="listings-table-wrap">
          <table className="listings-table" role="table" aria-label="Property listings">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Location</th>
                <th>Type</th>
                <th>Price/Night</th>
                <th>Guests</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing._id}>
                  <td>
                    <img
                      src={listing.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200'}
                      alt={listing.title}
                      className="listing-thumb"
                      loading="lazy"
                    />
                  </td>
                  <td>
                    <span className="listing-title-cell">{listing.title}</span>
                  </td>
                  <td>📍 {listing.location}</td>
                  <td><span className="type-badge">{listing.type}</span></td>
                  <td className="price-cell">${listing.price}</td>
                  <td>👥 {listing.guests}</td>
                  <td>⭐ {listing.rating || '—'}</td>
                  <td>
                    <div className="action-btns">
                      <Link
                        to={`/listings/edit/${listing._id}`}
                        className="btn btn-secondary action-btn"
                        aria-label={`Edit ${listing.title}`}
                      >
                        Edit
                      </Link>
                      {deleteConfirm === listing._id ? (
                        <div className="delete-confirm">
                          <span>Sure?</span>
                          <button
                            className="btn btn-danger action-btn"
                            onClick={() => handleDelete(listing._id)}
                            disabled={deleting}
                            aria-label="Confirm delete"
                          >
                            {deleting ? '...' : 'Yes'}
                          </button>
                          <button
                            className="btn btn-secondary action-btn"
                            onClick={() => setDeleteConfirm(null)}
                            aria-label="Cancel delete"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-danger action-btn"
                          onClick={() => setDeleteConfirm(listing._id)}
                          aria-label={`Delete ${listing.title}`}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default ViewListingsPage;
