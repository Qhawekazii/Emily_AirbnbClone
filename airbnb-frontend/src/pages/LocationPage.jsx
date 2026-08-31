/**
 * pages/LocationPage.jsx
 * Displays location cards for a selected city with filter and heading.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { SkeletonList } from '../components/SkeletonCard/SkeletonCard';
import api from '../api/axios';
import './LocationPage.css';

const FILTER_TYPES = ['All', 'Entire apartment', 'Entire house', 'Private room', 'Villa', 'Cabin', 'Beach house', 'Cottage'];

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
};

const LocationPage = () => {
  const { location } = useParams();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'price-asc' | 'price-desc' | 'rating'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const decodedLocation = decodeURIComponent(location);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/accommodations?location=${encodeURIComponent(decodedLocation)}`);
      // Handle both paginated {accommodations:[]} and plain array responses
      const data = Array.isArray(res.data) ? res.data : (res.data.accommodations || []);
      setListings(data);
      setFiltered(data);
    } catch {
      setError('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  }, [decodedLocation]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Apply type filter and sort
  useEffect(() => {
    let result = activeFilter === 'All' ? [...listings] : listings.filter((l) => l.type === activeFilter);
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setFiltered(result);
  }, [activeFilter, listings, sortBy]);

  return (
    <div className="location-page">
      <Header />
      <main className="location-main container">
        {/* Heading */}
        <div className="location-heading">
          <h1>
            {filtered.length} accommodation{filtered.length !== 1 ? 's' : ''} in{' '}
            <span className="location-name">{decodedLocation}</span>
          </h1>
          <p className="location-sub">Stays · Entire homes · Unique stays</p>
        </div>

        {/* Filter bar */}
        <div className="filter-sort-bar">
          <div className="filter-bar" role="group" aria-label="Filter by accommodation type">
            {FILTER_TYPES.map((type) => (
              <button
                key={type}
                className={`filter-pill ${activeFilter === type ? 'active' : ''}`}
                onClick={() => setActiveFilter(type)}
                aria-pressed={activeFilter === type}
              >
                {type}
              </button>
            ))}
          </div>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort listings"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Content */}
        {error && <div className="location-error">{error}</div>}

        {loading ? (
          <SkeletonList count={4} />
        ) : filtered.length === 0 ? (
          <div className="location-empty">
            <p>🏠</p>
            <h3>No listings found in {decodedLocation}</h3>
            <p>Try a different filter or explore another city.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        ) : (
          <div className="location-cards">
            {filtered.map((listing) => (
              <article
                key={listing._id}
                className="location-card"
                onClick={() => navigate(`/listing/${listing._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/listing/${listing._id}`)}
                aria-label={`View ${listing.title}`}
              >
                {/* Image */}
                <div className="card-img">
                  <img
                    src={listing.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'}
                    alt={listing.title}
                    loading="lazy"
                  />
                </div>

                {/* Details */}
                <div className="card-body">
                  <div className="card-type">{listing.type}</div>
                  <h2 className="card-title">{listing.title}</h2>

                  <div className="card-amenities">
                    {listing.amenities.slice(0, 3).join(' · ')}
                    {listing.amenities.length > 3 && ` · +${listing.amenities.length - 3} more`}
                  </div>

                  <div className="card-meta">
                    <div className="card-rating">
                      <StarRating rating={listing.rating || 0} />
                      <span className="rating-count">({listing.reviews})</span>
                    </div>
                    <div className="card-price">
                      <strong>${listing.price}</strong>
                      <span> / night</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LocationPage;
