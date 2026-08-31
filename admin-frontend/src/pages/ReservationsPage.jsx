/**
 * pages/ReservationsPage.jsx
 * Displays all reservations for the logged-in host in a table.
 */

import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './ReservationsPage.css';

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await api.get('/reservations/host');
        setReservations(res.data);
      } catch (err) {
        // If user is not a host, try fetching their own reservations
        try {
          const res = await api.get('/reservations/user');
          setReservations(res.data);
        } catch {
          setError('Failed to load reservations.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/reservations/${id}`);
      setReservations((prev) => prev.filter((r) => r._id !== id));
      setSuccessMsg('Reservation cancelled.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <main className="reservations-page container">
      <div className="reservations-header">
        <h1>Reservations</h1>
        <p>{reservations.length} reservation{reservations.length !== 1 ? 's' : ''}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <p>📅</p>
          <h3>No reservations yet</h3>
          <p>Reservations will appear here once guests book your listings.</p>
        </div>
      ) : (
        <div className="reservations-table-wrap">
          <table className="reservations-table" aria-label="Reservations">
            <thead>
              <tr>
                <th>Property</th>
                <th>Guest</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Nights</th>
                <th>Guests</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="res-listing">
                      {r.listingImage && (
                        <img src={r.listingImage} alt={r.listingTitle} className="res-thumb" loading="lazy" />
                      )}
                      <div>
                        <div className="res-title">{r.listingTitle || r.accommodation?.title || '—'}</div>
                        <div className="res-location">📍 {r.listingLocation || r.accommodation?.location || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.user?.username || 'Guest'}</td>
                  <td>{formatDate(r.checkIn)}</td>
                  <td>{formatDate(r.checkOut)}</td>
                  <td>{r.nights}</td>
                  <td>👥 {r.guests}</td>
                  <td className="total-cell">${r.totalCost?.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${r.status}`}>{r.status}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger action-btn"
                      onClick={() => handleCancel(r._id)}
                      disabled={deleting === r._id}
                      aria-label="Cancel reservation"
                    >
                      {deleting === r._id ? '...' : 'Cancel'}
                    </button>
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

export default ReservationsPage;
