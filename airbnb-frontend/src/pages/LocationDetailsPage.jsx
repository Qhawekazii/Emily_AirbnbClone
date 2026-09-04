/**
 * pages/LocationDetailsPage.jsx
 * Full listing details — matches Airbnb screenshots exactly.
 * SVG icons throughout, no emoji. Airbnb-style calculator sidebar.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import LoginModal from '../components/LoginModal/LoginModal';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Star, Heart, Share, MapPin, Award, Key, Sparkles, Calendar,
  Bed, Bath, Users, Shield, Home, MessageCircle, Clock,
  Minus, Plus, Camera, Info, CheckCircle, getAmenityIcon,
} from '../components/Icons';
import './LocationDetailsPage.css';

// ── Helpers ───────────────────────────────────────────────────────────────────
const StarRating = ({ rating = 0, count, inline = false }) => (
  <span className={`star-rating ${inline ? 'star-inline' : ''}`}>
    <Star size={14} filled />
    <strong>{Number(rating).toFixed(1)}</strong>
    {count != null && <span className="review-count">· {count} review{count !== 1 ? 's' : ''}</span>}
  </span>
);

const RatingBar = ({ label, value = 0 }) => (
  <div className="rating-bar-row">
    <span className="rbl">{label}</span>
    <div className="rbt" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={5}>
      <div className="rbf" style={{ width: `${(value / 5) * 100}%` }} />
    </div>
    <span className="rbv">{value.toFixed(1)}</span>
  </div>
);

// Format date nicely: "4 Sep 2026"
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// ── Main Component ────────────────────────────────────────────────────────────
const LocationDetailsPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [listing,        setListing]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState('');
  const [showLogin,      setShowLogin]      = useState(false);
  const [saved,          setSaved]          = useState(false);

  // Calculator
  const today     = new Date().toISOString().split('T')[0];
  const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const [checkIn,        setCheckIn]        = useState(today);
  const [checkOut,       setCheckOut]       = useState(weekLater);
  const [guestCount,     setGuestCount]     = useState(1);
  const [reserving,      setReserving]      = useState(false);
  const [reserveError,   setReserveError]   = useState('');
  const [reserveSuccess, setReserveSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/accommodations/${id}`);
        setListing(res.data);
      } catch {
        setFetchError('Listing not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Cost math ─────────────────────────────────────────────────────────────
  const nights      = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
  const baseTotal   = listing ? listing.price * nights : 0;
  const discountAmt = listing && nights >= 7 && listing.weeklyDiscount > 0
    ? (baseTotal * listing.weeklyDiscount) / 100 : 0;
  const cleaning    = listing?.cleaningFee    || 0;
  const service     = listing?.serviceFee     || 0;
  const taxes       = listing?.occupancyTaxes || 0;
  const grandTotal  = baseTotal - discountAmt + cleaning + service + taxes;

  const handleReserve = async () => {
    if (!user) { setShowLogin(true); return; }
    setReserving(true);
    setReserveError('');
    setReserveSuccess('');
    try {
      await api.post('/reservations', {
        accommodation: id,
        checkIn,
        checkOut,
        guests: guestCount,
      });
      setReserveSuccess('Reservation confirmed!');
    } catch (err) {
      setReserveError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  // ── Loading / Error states ────────────────────────────────────────────────
  if (loading) return (
    <div className="dp-loading">
      <div className="dp-spinner" />
    </div>
  );
  if (fetchError || !listing) return (
    <div className="dp-not-found">
      <h2>Listing not found</h2>
      <button className="dp-btn-primary" onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );

  // Pad images to 5
  const imgs = listing.images.length >= 5
    ? listing.images
    : [...listing.images, ...Array(5 - listing.images.length).fill(listing.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800')];

  const sr = listing.specificRatings || {};

  return (
    <div className="dp-page">
      <Header />

      <main className="dp-main dp-container">

        {/* ── Title row ──────────────────────────────────────────────────── */}
        <div className="dp-title-row">
          <h1 className="dp-title">{listing.title}</h1>
          <div className="dp-title-actions">
            <button className="dp-action-btn" onClick={() => navigator.share?.({ title: listing.title, url: window.location.href })}>
              <Share size={16} /> <span>Share</span>
            </button>
            <button className="dp-action-btn" onClick={() => setSaved(s => !s)}>
              <Heart size={16} filled={saved} /> <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* ── Subheading ─────────────────────────────────────────────────── */}
        <div className="dp-subheading">
          <StarRating rating={listing.rating} count={listing.reviews} inline />
          <span className="dp-sep">·</span>
          <span className="dp-superhost"><Award size={14} /> Superhost</span>
          <span className="dp-sep">·</span>
          <span className="dp-location"><MapPin size={14} /> {listing.location}</span>
        </div>

        {/* ── Gallery ────────────────────────────────────────────────────── */}
        <div className="dp-gallery">
          <div className="dp-gallery-main">
            <img src={imgs[0]} alt={listing.title} loading="eager" />
          </div>
          <div className="dp-gallery-grid">
            {imgs.slice(1, 5).map((img, i) => (
              <div key={i} className="dp-gallery-thumb">
                <img src={img} alt={`${listing.title} view ${i + 2}`} loading="lazy" />
              </div>
            ))}
          </div>
          <button className="dp-show-photos">
            <Camera size={16} /> Show all photos
          </button>
        </div>

        {/* ── Two columns ────────────────────────────────────────────────── */}
        <div className="dp-columns">

          {/* ── LEFT ───────────────────────────────────────────────────── */}
          <div className="dp-left">

            {/* Host row */}
            <div className="dp-host-row">
              <div>
                <h2 className="dp-host-title">
                  {listing.type} hosted by {listing.host}
                </h2>
                <p className="dp-host-meta">
                  <Users size={14} /> {listing.guests} guests
                  <span className="dp-dot" />
                  <Bed size={14} /> {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}
                  <span className="dp-dot" />
                  <Bath size={14} /> {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="dp-host-avatar">
                {listing.host.charAt(0).toUpperCase()}
                <span className="dp-host-superhost-badge" title="Superhost">
                  <Award size={10} />
                </span>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="dp-highlights">
              {listing.selfCheckIn && (
                <div className="dp-highlight">
                  <Key size={22} className="dp-hi-icon" />
                  <div>
                    <strong>Self check-in</strong>
                    <p>Check yourself in with the lockbox.</p>
                  </div>
                </div>
              )}
              {listing.enhancedCleaning && (
                <div className="dp-highlight">
                  <Sparkles size={22} className="dp-hi-icon" />
                  <div>
                    <strong>Enhanced Clean</strong>
                    <p>This host committed to Airbnb's 5-step enhanced cleaning process.</p>
                  </div>
                </div>
              )}
              <div className="dp-highlight">
                <Calendar size={22} className="dp-hi-icon" />
                <div>
                  <strong>Free cancellation before check-in</strong>
                  <p>Get a full refund if you cancel.</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="dp-section dp-description">
              <p>{listing.description}</p>
              <button className="dp-show-more">Show more <span>›</span></button>
            </div>

            {/* Where you'll sleep */}
            <div className="dp-section">
              <h3>Where you'll sleep</h3>
              <div className="dp-sleep-grid">
                {Array.from({ length: Math.max(1, listing.bedrooms) }).map((_, i) => (
                  <div key={i} className="dp-sleep-card">
                    <Bed size={28} />
                    <strong>Bedroom {i + 1}</strong>
                    <span>1 queen bed</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What this place offers */}
            <div className="dp-section">
              <h3>What this place offers</h3>
              <div className="dp-amenities-grid">
                {listing.amenities.map((a) => {
                  const AIcon = getAmenityIcon(a);
                  return (
                    <div key={a} className="dp-amenity-row">
                      <AIcon size={20} />
                      <span>{a}</span>
                    </div>
                  );
                })}
              </div>
              {listing.amenities.length > 6 && (
                <button className="dp-amenities-btn">
                  Show all {listing.amenities.length} amenities
                </button>
              )}
            </div>

            {/* Nights / Calendar section */}
            <div className="dp-section dp-nights-section">
              <h3>
                {nights} night{nights !== 1 ? 's' : ''} in {listing.location}
              </h3>
              <p className="dp-nights-dates">
                {fmtDate(checkIn)} – {fmtDate(checkOut)}
              </p>
              {/* Inline date grid — mirrors Airbnb's calendar display */}
              <div className="dp-date-display">
                <div className="dp-date-col">
                  <span className="dp-date-label">CHECK-IN</span>
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => { setCheckIn(e.target.value); setReserveSuccess(''); }}
                    className="dp-date-input"
                  />
                </div>
                <div className="dp-date-col">
                  <span className="dp-date-label">CHECKOUT</span>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => { setCheckOut(e.target.value); setReserveSuccess(''); }}
                    className="dp-date-input"
                  />
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="dp-section dp-reviews-section">
              <h3 className="dp-reviews-heading">
                <Star size={18} filled />
                {Number(listing.rating).toFixed(1)} · {listing.reviews} review{listing.reviews !== 1 ? 's' : ''}
              </h3>
              {Object.keys(sr).length > 0 && (
                <div className="dp-ratings-grid">
                  <div>
                    {sr.cleanliness   != null && <RatingBar label="Cleanliness"   value={sr.cleanliness}   />}
                    {sr.communication != null && <RatingBar label="Communication" value={sr.communication} />}
                    {sr.checkIn       != null && <RatingBar label="Check-in"      value={sr.checkIn}       />}
                  </div>
                  <div>
                    {sr.accuracy  != null && <RatingBar label="Accuracy"  value={sr.accuracy}  />}
                    {sr.location  != null && <RatingBar label="Location"  value={sr.location}  />}
                    {sr.value     != null && <RatingBar label="Value"     value={sr.value}     />}
                  </div>
                </div>
              )}
              {/* Sample review cards */}
              <div className="dp-review-cards">
                {[
                  { name: 'Sarah', date: 'September 2026', text: 'Amazing place! The location is perfect and the host was very responsive. Highly recommend.' },
                  { name: 'James', date: 'August 2026',    text: 'Beautiful property, clean and well equipped. Would definitely stay again.' },
                ].map((r) => (
                  <div key={r.name} className="dp-review-card">
                    <div className="dp-reviewer">
                      <div className="dp-reviewer-avatar">{r.name[0]}</div>
                      <div>
                        <strong>{r.name}</strong>
                        <span>{r.date}</span>
                      </div>
                    </div>
                    <p>{r.text}</p>
                  </div>
                ))}
              </div>
              <button className="dp-show-more">Show all {listing.reviews} reviews</button>
            </div>

            {/* About host */}
            <div className="dp-section dp-host-section">
              <h3>Hosted by {listing.host}</h3>
              <div className="dp-host-card">
                <div className="dp-host-avatar-lg">{listing.host.charAt(0).toUpperCase()}</div>
                <div className="dp-host-info">
                  <p className="dp-host-stats">
                    <Award size={14} /> Superhost &nbsp;·&nbsp; 3 years hosting
                  </p>
                  <p className="dp-host-bio">
                    Hi, I'm {listing.host}! I love sharing unique spaces with travellers from around the world. I'm always available and happy to help make your stay special.
                  </p>
                  <div className="dp-host-badges">
                    <span><CheckCircle size={14} /> Identity verified</span>
                    <span><MessageCircle size={14} /> Response rate: 100%</span>
                    <span><Clock size={14} /> Responds within an hour</span>
                  </div>
                  <button className="dp-contact-btn">Contact Host</button>
                </div>
              </div>
              <div className="dp-host-note">
                <Info size={14} />
                <p>To protect your payment, never transfer money or communicate outside of the Airbnb website or app.</p>
              </div>
            </div>

            {/* Things to know */}
            <div className="dp-section">
              <h3>Things to know</h3>
              <div className="dp-rules-grid">
                <div className="dp-rules-col">
                  <h4><Home size={16} /> House rules</h4>
                  <ul>
                    <li><Clock size={14} /> Check-in after 4:00 PM</li>
                    <li><Clock size={14} /> Checkout: 10:00 AM</li>
                    <li><Users size={14} /> Max {listing.guests} guests</li>
                    <li><Shield size={14} /> No smoking</li>
                    <li><Shield size={14} /> No parties or events</li>
                  </ul>
                </div>
                <div className="dp-rules-col">
                  <h4><Shield size={16} /> Health &amp; safety</h4>
                  <ul>
                    <li><CheckCircle size={14} /> Enhanced cleaning protocol</li>
                    <li><CheckCircle size={14} /> Carbon monoxide alarm</li>
                    <li><CheckCircle size={14} /> Smoke alarm</li>
                    <li><Info size={14} /> Security camera on property</li>
                  </ul>
                </div>
                <div className="dp-rules-col">
                  <h4><Calendar size={16} /> Cancellation policy</h4>
                  <ul>
                    <li>Free cancellation before check-in</li>
                    <li>Review the full cancellation policy</li>
                    <li>Full refund if cancelled within 48 hrs</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>{/* end dp-left */}

          {/* ── RIGHT — Calculator ──────────────────────────────────────── */}
          <aside className="dp-calc" aria-label="Booking calculator">
            <div className="dp-calc-card">

              {/* Price + rating header */}
              <div className="dp-calc-header">
                <div className="dp-calc-price">
                  <span className="dp-price-amount">${listing.price}</span>
                  <span className="dp-price-unit"> / night</span>
                </div>
                <StarRating rating={listing.rating} count={listing.reviews} inline />
              </div>

              {/* Date grid */}
              <div className="dp-calc-dates">
                <div className="dp-calc-date-field dp-calc-date-left">
                  <label>CHECK-IN</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => { setCheckIn(e.target.value); setReserveSuccess(''); setReserveError(''); }}
                  />
                </div>
                <div className="dp-calc-date-field dp-calc-date-right">
                  <label>CHECKOUT</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => { setCheckOut(e.target.value); setReserveSuccess(''); setReserveError(''); }}
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="dp-calc-guests">
                <div className="dp-calc-guest-label">
                  <label>GUESTS</label>
                  <span>{guestCount} guest{guestCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="dp-guest-counter">
                  <button
                    onClick={() => setGuestCount(g => Math.max(1, g - 1))}
                    disabled={guestCount <= 1}
                    aria-label="Remove guest"
                  >
                    <Minus size={14} />
                  </button>
                  <span>{guestCount}</span>
                  <button
                    onClick={() => setGuestCount(g => Math.min(listing.guests, g + 1))}
                    disabled={guestCount >= listing.guests}
                    aria-label="Add guest"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Reserve button */}
              {reserveSuccess ? (
                <div className="dp-reserve-success">
                  <CheckCircle size={18} /> {reserveSuccess}
                </div>
              ) : (
                <button
                  className="dp-reserve-btn"
                  onClick={handleReserve}
                  disabled={reserving}
                >
                  {reserving ? 'Processing…' : user ? 'Reserve' : 'Log in to Reserve'}
                </button>
              )}

              {!reserveSuccess && (
                <p className="dp-no-charge">You won't be charged yet</p>
              )}

              {reserveError && (
                <div className="dp-reserve-error">
                  <Info size={14} /> {reserveError}
                </div>
              )}

              {/* Price breakdown */}
              <div className="dp-breakdown">
                <div className="dp-br-row">
                  <span>${listing.price} × {nights} night{nights !== 1 ? 's' : ''}</span>
                  <span>${baseTotal.toFixed(2)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="dp-br-row dp-br-discount">
                    <span>Weekly discount</span>
                    <span>−${discountAmt.toFixed(2)}</span>
                  </div>
                )}
                {cleaning > 0 && (
                  <div className="dp-br-row">
                    <span>Cleaning fee</span>
                    <span>${cleaning.toFixed(2)}</span>
                  </div>
                )}
                {service > 0 && (
                  <div className="dp-br-row">
                    <span>Service fee</span>
                    <span>${service.toFixed(2)}</span>
                  </div>
                )}
                {taxes > 0 && (
                  <div className="dp-br-row">
                    <span>Occupancy taxes and fees</span>
                    <span>${taxes.toFixed(2)}</span>
                  </div>
                )}
                <div className="dp-br-row dp-br-total">
                  <strong>Total</strong>
                  <strong>${grandTotal.toFixed(2)}</strong>
                </div>
              </div>

              <button className="dp-report-link">
                <Info size={12} /> Report this listing
              </button>

            </div>
          </aside>

        </div>{/* end dp-columns */}
      </main>

      <Footer />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default LocationDetailsPage;
