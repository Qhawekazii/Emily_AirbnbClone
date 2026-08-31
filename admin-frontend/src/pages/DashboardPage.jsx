/**
 * pages/DashboardPage.jsx
 * Admin overview dashboard — stats cards and quick links.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './DashboardPage.css';

const StatCard = ({ label, value, icon, color, to }) => (
  <Link to={to} className="stat-card" style={{ '--card-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ listings: 0, reservations: 0 });
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, reservationsRes] = await Promise.all([
          api.get('/accommodations'),
          api.get('/reservations/host').catch(() => ({ data: [] })),
        ]);
        setStats({
          listings: listingsRes.data.length,
          reservations: reservationsRes.data.length,
        });
        setRecentListings(listingsRes.data.slice(0, 4));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <main className="dashboard container">
      {/* Welcome banner */}
      <section className="dashboard-welcome">
        <div>
          <h1>Welcome back, {user?.username} 👋</h1>
          <p>Here's an overview of your property listings and reservations.</p>
        </div>
        <Link to="/listings/create" className="btn btn-primary">+ Add New Listing</Link>
      </section>

      {/* Stats */}
      <section className="stats-grid" aria-label="Dashboard statistics">
        <StatCard label="Total Listings" value={stats.listings} icon="🏠" color="#FF385C" to="/listings" />
        <StatCard label="Reservations" value={stats.reservations} icon="📅" color="#4CAF50" to="/reservations" />
        <StatCard label="Locations" value="6" icon="📍" color="#2196F3" to="/listings" />
        <StatCard label="Active Today" value={stats.listings} icon="✅" color="#FF9800" to="/listings" />
      </section>

      {/* Recent listings */}
      <section className="recent-section">
        <div className="recent-header">
          <h2>Recent Listings</h2>
          <Link to="/listings" className="view-all">View all →</Link>
        </div>
        <div className="recent-grid">
          {recentListings.map((listing) => (
            <div key={listing._id} className="recent-card">
              <div className="recent-img">
                <img
                  src={listing.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'}
                  alt={listing.title}
                  loading="lazy"
                />
              </div>
              <div className="recent-body">
                <h3>{listing.title}</h3>
                <p>📍 {listing.location}</p>
                <p className="recent-price">${listing.price}<span>/night</span></p>
                <div className="recent-actions">
                  <Link to={`/listings/edit/${listing._id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>Edit</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default DashboardPage;
