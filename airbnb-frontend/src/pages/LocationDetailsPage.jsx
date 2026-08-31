/**
 * pages/LocationDetailsPage.jsx
 * Full listing details page:
 *  - Heading & subheading
 *  - Image gallery (1 large + 4 smaller)
 *  - Two-column layout: static info left, cost calculator right
 *  - Static info sections: amenities, sleep, reviews, host, rules
 *  - Footer
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import LoginModal from '../components/LoginModal/LoginModal';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './LocationDetailsPage.css';

// ── Helpers ───────────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = 'sm' }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className={`stars stars-${size}`} aria-label={`${rating} out of 5`}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
};

const RatingBar = ({ label, value }) => (
  <div className="rating-bar-row">
    <span className="rating-bar-label">{label}</span>
    <div className="rating-bar-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={5}>
      <div className="rating-bar-fill" style={{ width: `${(value / 5) * 100}%` }} />
    </div>
    <span className="rating-bar-val">{value.toFixed(1)}</span>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const LocationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  // Calculator state
  const today = new Date().toISOString().split('T')[0];
  const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(weekLater);
  const [guestCount, setGuestCount] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState('');
  const [reserveSuccess, setReserveSuccess] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/accommodations/${id}`);
        setListing(res.data);
        setGuestCount(1);
      } catch {
        setError('Listing not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  // ── Calculator logic ──────────────────────────────────────────────────────
  const calcNights = () => {
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(1, Math.ceil(diff / 86400000));
  };

  const nights = calcNights();
  const baseTotal = listing ? listing.price * nights : 0;
  const discountAmt = listing && nights >= 7 && listing.weeklyDiscount > 0
    ? (baseTotal * listing.weeklyDiscount) / 100 : 0;
  const cleaning = listing?.cleaningFee || 0;
  const service = listing?.serviceFee || 0;
  const taxes = listing?.occupancyTaxes || 0;
  const grandTotal = baseTotal - discountAmt + cleaning + service + taxes;

  const handleReserve = async () => {
    if (!user) { setShowLogin(true); return; }
    setReserving(true);
    setReserveError('');
    try {
      await api.post('/reservations', {
        accommodation: id,
        checkIn,
        checkOut,
        guests: guestCount,
      });
      setReserveSuccess('🎉 Reservation confirmed! Check your reservations page.');
    } catch (err) {
      setReserveError(err.response?.data?.message || 'Reservation failed. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <div className="spinner-wrap" style={{ height: '100vh' }}><div className="spinner" /></div>;
  if (error || !listing) return (
    <div className="details-error">
      <h2>Listing not found</h2>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );

  const images = listing.images.length >= 5
    ? listing.images
    : [...listing.images, ...Array(5 - listing.images.length).fill(listing.images[0] || '')];

  const sr = listing.specificRatings || {};

  return (
    <div className="details-page">
      <Header />
      <main className="details-main container">

        {/* ── Heading ──────────────────────────────────────────────────────── */}
        <section className="details-heading" aria-labelledby="listing-title">
          <h1 id="listing-title">{listing.title}</h1>
          <div className="details-subheading">
            <StarRating rating={listing.rating || 0} size="md" />
            <span className="details-reviews">({listing.reviews} reviews)</span>
            <span className="details-sep">·</span>
            <span className="details-superhost">🏆 Superhost</span>
            <span className="details-sep">·</span>
            <span className="details-location">📍 {listing.location}</span>
          </div>
        </section>

        {/* ── Image Gallery ─────────────────────────────────────────────────── */}
        <section className="gallery" aria-label="Property images">
          <div className="gallery-large">
            <img src={images[0]} alt={`${listing.title} - main`} loading="eager" />
          </div>
          <div className="gallery-grid">
            {images.slice(1, 5).map((img, i) => (
              <div key={i} className="gallery-small">
                <img src={img} alt={`${listing.title} - view ${i + 2}`} loading="lazy" />
              </div>
            ))}
          </div>
        </section>

        {/* ── Two Column Layout ─────────────────────────────────────────────── */}
        <div className="details-columns">
          {/* LEFT: Info ─────────────────────────────────────────────────────── */}
          <div className="details-info">
            {/* Accommodation details */}
            <section className="info-section">
              <div className="info-host-row">
                <div>
                  <h2>{listing.type} hosted by {listing.host}</h2>
                  <p className="info-capacity">
                    {listing.guests} guests · {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''} ·{' '}
                    {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="host-avatar" aria-label={`Host ${listing.host}`}>
                  {listing.host.charAt(0).toUpperCase()}
                </div>
              </div>
            </section>

            {/* Highlight badges */}
            <section className="info-section highlights">
              {listing.selfCheckIn && (
                <div className="highlight-item">
                  <span className="hi-icon" aria-hidden="true">🔑</span>
                  <div>
                    <strong>Self check-in</strong>
                    <p>Check yourself in with the lockbox.</p>
                  </div>
                </div>
              )}
              {listing.enhancedCleaning && (
                <div className="highlight-item">
                  <span className="hi-icon" aria-hidden="true">✨</span>
                  <div>
                    <strong>Enhanced Clean</strong>
                    <p>This host committed to Airbnb's 5-step enhanced cleaning process.</p>
                  </div>
                </div>
              )}
              <div className="highlight-item">
                <span className="hi-icon" aria-hidden="true">🗓️</span>
                <div>
                  <strong>Free cancellation</strong>
                  <p>Cancel before check-in for a partial refund.</p>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="info-section">
              <p className="listing-description">{listing.description}</p>
            </section>

            {/* Where you'll sleep */}
            <section className="info-section" aria-labelledby="sleep-heading">
              <h3 id="sleep-heading">Where you'll sleep</h3>
              <div className="sleep-grid">
                {Array.from({ length: Math.max(1, listing.bedrooms) }).map((_, i) => (
                  <div key={i} className="sleep-card">
                    <span className="sleep-icon" aria-hidden="true">🛏️</span>
                    <strong>Bedroom {i + 1}</strong>
                    <span>1 queen bed</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Amenities */}
            <section className="info-section" aria-labelledby="amenities-heading">
              <h3 id="amenities-heading">What this place offers</h3>
              <div className="amenities-list">
                {listing.amenities.map((a) => (
                  <div key={a} className="amenity-item">
                    <span aria-hidden="true">✓</span> {a}
                  </div>
                ))}
              </div>
            </section>

            {/* 7 nights section */}
            <section className="info-section nights-section" aria-labelledby="nights-heading">
              <h3 id="nights-heading">{nights} night{nights !== 1 ? 's' : ''} in {listing.location}</h3>
              <p className="nights-dates">
                {new Date(checkIn).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })} –{' '}
                {new Date(checkOut).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </section>

            {/* Reviews */}
            <section className="info-section" aria-labelledby="reviews-heading">
              <h3 id="reviews-heading">
                <StarRating rating={listing.rating} size="md" />
                <span style={{ marginLeft: 8 }}>{listing.rating} · {listing.reviews} reviews</span>
              </h3>
              {Object.keys(sr).length > 0 && (
                <div className="ratings-breakdown">
                  {sr.cleanliness   != null && <RatingBar label="Cleanliness"   value={sr.cleanliness}   />}
                  {sr.communication != null && <RatingBar label="Communication" value={sr.communication} />}
                  {sr.checkIn       != null && <RatingBar label="Check-in"      value={sr.checkIn}       />}
                  {sr.accuracy      != null && <RatingBar label="Accuracy"      value={sr.accuracy}      />}
                  {sr.location      != null && <RatingBar label="Location"      value={sr.location}      />}
                  {sr.value         != null && <RatingBar label="Value"         value={sr.value}         />}
                </div>
              )}
            </section>

            {/* Host details */}
            <section className="info-section host-section" aria-labelledby="host-heading">
              <h3 id="host-heading">About your host</h3>
              <div className="host-card">
                <div className="host-avatar-lg">{listing.host.charAt(0).toUpperCase()}</div>
                <div>
                  <strong className="host-name">{listing.host}</strong>
                  <p className="host-meta">Superhost · 3 years hosting</p>
                  <p className="host-bio">Hi, I'm {listing.host}! I love sharing my home with guests from around the world. I'll make sure you feel welcome and have everything you need.</p>
                </div>
              </div>
            </section>

            {/* House Rules, Health & Safety, Cancellation */}
            <section className="info-section rules-section" aria-labelledby="rules-heading">
              <div className="rules-grid">
                <div className="rules-col">
                  <h4 id="rules-heading">🏠 House rules</h4>
                  <ul>
                    <li>Check-in: 3:00 PM – 10:00 PM</li>
                    <li>Checkout: 11:00 AM</li>
                    <li>Max {listing.guests} guests</li>
                    <li>No smoking</li>
                    <li>No parties or events</li>
                  </ul>
                </div>
                <div className="rules-col">
                  <h4>🛡️ Health & safety</h4>
                  <ul>
                    <li>Airbnb's COVID-19 safety requirements apply</li>
                    <li>Carbon monoxide alarm</li>
                    <li>Smoke alarm</li>
                    <li>Security camera/recording device</li>
                  </ul>
                </div>
                <div className="rules-col">
                  <h4>🔄 Cancellation policy</h4>
                  <ul>
                    <li>Free cancellation before check-in</li>
                    <li>Review the host's full cancellation policy</li>
                    <li>Get a full refund if you cancel within 48 hrs</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: Cost Calculator ────────────────────────────────────────── */}
          <aside className="details-calculator" aria-label="Booking calculator">
            <div className="calc-card">
              <div className="calc-price-header">
                <span className="calc-price">${listing.price}</span>
                <span className="calc-per-night"> / night</span>
                <div className="calc-rating-inline">
                  <StarRating rating={listing.rating} />
                  <span>{listing.reviews} reviews</span>
                </div>
              </div>

              {/* Date pickers */}
              <div className="calc-dates">
                <div className="date-field">
                  <label htmlFor="checkin-date">CHECK-IN</label>
                  <input
                    id="checkin-date"
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => { setCheckIn(e.target.value); setReserveSuccess(''); }}
                    aria-label="Check-in date"
                  />
                </div>
                <div className="date-divider" aria-hidden="true" />
                <div className="date-field">
                  <label htmlFor="checkout-date">CHECKOUT</label>
                  <input
                    id="checkout-date"
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => { setCheckOut(e.target.value); setReserveSuccess(''); }}
                    aria-label="Check-out date"
                  />
                </div>
              </div>

              {/* Guest count */}
              <div className="calc-guests">
                <label htmlFor="guest-count">GUESTS</label>
                <div className="guest-counter">
                  <button
                    onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
                    aria-label="Decrease guests"
                    disabled={guestCount <= 1}
                  >−</button>
                  <span id="guest-count" aria-live="polite">{guestCount} guest{guestCount !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => setGuestCount((g) => Math.min(listing.guests, g + 1))}
                    aria-label="Increase guests"
                    disabled={guestCount >= listing.guests}
                  >+</button>
                </div>
              </div>

              {/* Reserve button */}
              {reserveSuccess ? (
                <div className="reserve-success">{reserveSuccess}</div>
              ) : (
                <button
                  className="btn btn-primary calc-reserve-btn"
                  onClick={handleReserve}
                  disabled={reserving}
                  aria-label="Reserve this listing"
                >
                  {reserving ? 'Processing...' : user ? 'Reserve' : 'Log in to Reserve'}
                </button>
              )}

              {reserveError && <div className="reserve-error">{reserveError}</div>}

              {/* Cost breakdown */}
              <div className="calc-breakdown" aria-label="Cost breakdown">
                <div className="breakdown-row">
                  <span>${listing.price} × {nights} night{nights !== 1 ? 's' : ''}</span>
                  <span>${baseTotal.toFixed(2)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="breakdown-row discount">
                    <span>Weekly discount ({listing.weeklyDiscount}%)</span>
                    <span>−${discountAmt.toFixed(2)}</span>
                  </div>
                )}
                {cleaning > 0 && (
                  <div className="breakdown-row">
                    <span>Cleaning fee</span>
                    <span>${cleaning.toFixed(2)}</span>
                  </div>
                )}
                {service > 0 && (
                  <div className="breakdown-row">
                    <span>Service fee</span>
                    <span>${service.toFixed(2)}</span>
                  </div>
                )}
                {taxes > 0 && (
                  <div className="breakdown-row">
                    <span>Occupancy taxes & fees</span>
                    <span>${taxes.toFixed(2)}</span>
                  </div>
                )}
                <div className="breakdown-row total">
                  <strong>Total</strong>
                  <strong>${grandTotal.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default LocationDetailsPage;
