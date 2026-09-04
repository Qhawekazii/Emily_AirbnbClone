/**
 * pages/UserReservationsPage.jsx
 * Displays all reservations made by the logged-in user
 * with option to cancel each one.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { Calendar, MapPin, Users } from '../components/Icons';
import api from '../api/axios';
import './UserReservationsPage.css';

const UserReservationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    const fetch = async () => {
      try {
        const res = await api.get('/reservations/user');
        setReservations(res.data);
      } catch {
        setError('Failed to load reservations.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, navigate]);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await api.delete(`/reservations/${id}`);
      setReservations((prev) => prev.filter((r) => r._id !== id));
      setSuccess('Reservation cancelled successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setCancelling(null);
    }
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="user-res-page">
      <Header />
      <main className="user-res-main container">
        <h1>My Reservations</h1>
        <p className="user-res-sub">{reservations.length} trip{reservations.length !== 1 ? 's' : ''} booked</p>

        {error && <div className="res-alert res-alert-error">{error}</div>}
        {success && <div className="res-alert res-alert-success">{success}</div>}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : reservations.length === 0 ? (
          <div className="res-empty">
            <div className="res-empty-icon"><Calendar size={42} /></div>
            <h3>No trips booked yet</h3>
            <p>Time to dust off your bags and explore!</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Start exploring</button>
          </div>
        ) : (
          <div className="res-cards">
            {reservations.map((r) => (
              <div key={r._id} className="res-card">
                <div className="res-card-img">
                  <img
                    src={r.listingImage || r.accommodation?.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'}
                    alt={r.listingTitle}
                    loading="lazy"
                  />
                </div>
                <div className="res-card-body">
                  <div className="res-card-type">Entire stay</div>
                  <h3>{r.listingTitle || r.accommodation?.title}</h3>
                  <p className="res-card-location"><MapPin size={14} /> {r.listingLocation || r.accommodation?.location}</p>
                  <div className="res-card-dates">
                    <span><Calendar size={14} /> {fmt(r.checkIn)} → {fmt(r.checkOut)}</span>
                    <span>· {r.nights} night{r.nights !== 1 ? 's' : ''}</span>
                    <span>· <Users size={14} /> {r.guests} guest{r.guests !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="res-card-footer">
                    <span className="res-card-total">Total: <strong>${r.totalCost?.toFixed(2)}</strong></span>
                    <span className={`res-status status-${r.status}`}>{r.status}</span>
                    <button
                      className="btn btn-danger res-cancel-btn"
                      onClick={() => handleCancel(r._id)}
                      disabled={cancelling === r._id}
                    >
                      {cancelling === r._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UserReservationsPage;
