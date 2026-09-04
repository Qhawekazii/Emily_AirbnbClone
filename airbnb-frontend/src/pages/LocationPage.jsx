/**
 * pages/LocationPage.jsx
 * Location listing page — matches Airbnb screenshots exactly.
 * Horizontal cards: image left, details right. Heart wishlist button.
 * Filter pills + sort select. SVG icons throughout.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { SkeletonList } from '../components/SkeletonCard/SkeletonCard';
import { Star, Heart, MapPin, Users, Bed, Bath, Wifi, SlidersHorizontal } from '../components/Icons';
import api from '../api/axios';
import './LocationPage.css';

const FILTER_TYPES = [
  'All', 'Entire apartment', 'Entire house', 'Private room',
  'Villa', 'Cabin', 'Beach house', 'Cottage',
];

// Render up to 5 star SVGs based on rating
const Stars = ({ rating = 0 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="lp-stars" aria-label={`${rating} out of 5 stars`}>
      <Star size={12} filled />
      <strong>{Number(rating).toFixed(1)}</strong>
    </span>
  );
};

const LocationPage = () => {
  const { location } = useParams();
  const navigate     = useNavigate();
  const decoded      = decodeURIComponent(location);

  const [listings,      setListings]      = useState([]);
  const [filtered,      setFiltered]      = useState([]);
  const [activeFilter,  setActiveFilter]  = useState('All');
  const [sortBy,        setSortBy]        = useState('default');
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [saved,         setSaved]         = useState({});    // id → bool

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await api.get(`/accommodations?location=${encodeURIComponent(decoded)}`);
      const data = Array.isArray(res.data) ? res.data : (res.data.accommodations || []);
      setListings(data);
      setFiltered(data);
    } catch {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [decoded]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Apply filter + sort
  useEffect(() => {
    let result = activeFilter === 'All'
      ? [...listings]
      : listings.filter((l) => l.type === activeFilter);

    if (sortBy === 'price-asc')  result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     result.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    setFiltered(result);
  }, [activeFilter, listings, sortBy]);

  const toggleSave = (e, id) => {
    e.stopPropagation();
    setSaved(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="lp-page">
      <Header />
      <main className="lp-main lp-container">

        {/* ── Heading ──────────────────────────────────────────────────── */}
        <div className="lp-heading">
          <h1>
            <span className="lp-count">{filtered.length}+ stays</span>
            {' '}in <span className="lp-city">{decoded}</span>
          </h1>
        </div>

        {/* ── Filter + sort bar ─────────────────────────────────────────── */}
        <div className="lp-toolbar">
          <div className="lp-filters" role="group" aria-label="Filter by type">
            {FILTER_TYPES.map((type) => (
              <button
                key={type}
                className={`lp-filter-pill ${activeFilter === type ? 'lp-active' : ''}`}
                onClick={() => setActiveFilter(type)}
                aria-pressed={activeFilter === type}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="lp-sort-wrap">
            <SlidersHorizontal size={14} />
            <select
              className="lp-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort listings"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        {error && (
          <div className="lp-error" role="alert">{error}</div>
        )}

        {loading ? (
          <SkeletonList count={4} />
        ) : filtered.length === 0 ? (
          <div className="lp-empty">
            <MapPin size={40} />
            <h3>No stays found in {decoded}</h3>
            <p>Try a different filter or explore another destination.</p>
            <button className="lp-btn-primary" onClick={() => navigate('/')}>
              Explore destinations
            </button>
          </div>
        ) : (
          <div className="lp-cards">
            {filtered.map((listing) => (
              <article
                key={listing._id}
                className="lp-card"
                onClick={() => navigate(`/listing/${listing._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/listing/${listing._id}`)}
                aria-label={`View ${listing.title}`}
              >
                {/* Image */}
                <div className="lp-card-img">
                  <img
                    src={listing.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'}
                    alt={listing.title}
                    loading="lazy"
                  />
                  {/* Heart button */}
                  <button
                    className="lp-heart-btn"
                    onClick={(e) => toggleSave(e, listing._id)}
                    aria-label={saved[listing._id] ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart size={20} filled={saved[listing._id]} />
                  </button>
                </div>

                {/* Details */}
                <div className="lp-card-body">
                  {/* Type + location */}
                  <div className="lp-card-type">
                    {listing.type} in {listing.location}
                  </div>

                  {/* Title */}
                  <h2 className="lp-card-title">{listing.title}</h2>

                  {/* Capacity row */}
                  <div className="lp-card-capacity">
                    <span><Users size={13} /> {listing.guests} guests</span>
                    <span className="lp-cdot">·</span>
                    <span><Bed size={13} /> {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}</span>
                    <span className="lp-cdot">·</span>
                    <span><Bath size={13} /> {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Amenities */}
                  <div className="lp-card-amenities">
                    {listing.amenities.slice(0, 3).map((a, i) => (
                      <span key={a}>
                        {i > 0 && <span className="lp-cdot">·</span>}
                        {a}
                      </span>
                    ))}
                    {listing.amenities.length > 3 && (
                      <span className="lp-cdot">·</span>
                    )}
                    {listing.amenities.length > 3 && (
                      <span>+{listing.amenities.length - 3} more</span>
                    )}
                  </div>

                  {/* Rating + Price */}
                  <div className="lp-card-footer">
                    <div className="lp-card-rating">
                      {listing.rating > 0 && (
                        <>
                          <Stars rating={listing.rating} />
                          <span className="lp-review-count">({listing.reviews})</span>
                        </>
                      )}
                    </div>
                    <div className="lp-card-price">
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
