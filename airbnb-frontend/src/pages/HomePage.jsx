/**
 * pages/HomePage.jsx
 * Full Airbnb home page:
 *  - Hero Banner
 *  - Inspiration / Location cards
 *  - Discover Airbnb Experiences (2 sections)
 *  - ShopAirbnb section
 *  - Future Getaways (tabs)
 *  - Footer
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './HomePage.css';

// ── Data ──────────────────────────────────────────────────────────────────────
const INSPIRATION_CARDS = [
  { city: 'New York', time: '2 hours away', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
  { city: 'Cape Town', time: '10 hours away', img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400' },
  { city: 'Paris', time: '8 hours away', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400' },
  { city: 'Tokyo', time: '14 hours away', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
  { city: 'London', time: '11 hours away', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
  { city: 'Bali', time: '16 hours away', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  { city: 'Sydney', time: '20 hours away', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400' },
  { city: 'Dubai', time: '9 hours away', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
];

const GETAWAYS_TABS = [
  {
    label: 'Outdoors',
    items: ['Mountain Cabin – Colorado', 'Treehouse – Costa Rica', 'Safari Lodge – Kenya', 'Beach Cottage – Maldives', 'Lakeside Retreat – Canada'],
  },
  {
    label: 'Unique stays',
    items: ['Lighthouse – Maine', 'Cave House – Turkey', 'Ice Hotel – Sweden', 'Floating Houseboat – Amsterdam', 'Underwater Room – Fiji'],
  },
  {
    label: 'Entire homes',
    items: ['Villa – Santorini', 'Chateau – Loire Valley', 'Ranch – Montana', 'Penthouse – Singapore', 'Riad – Marrakech'],
  },
  {
    label: 'Pets allowed',
    items: ['Dog-friendly cabin – Vermont', 'Farm stay – Tuscany', 'Ranch house – Texas', 'Cottage – Lake District', 'Beach house – Portugal'],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const goToLocation = (city) => navigate(`/locations/${encodeURIComponent(city)}`);

  return (
    <div className="home-page">
      <Header transparent />

      {/* ── 1. Hero Banner ─────────────────────────────────────────────────── */}
      <section className="hero" aria-label="Hero banner">
        <div className="hero-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600)' }} />
        <div className="hero-overlay" />
        <div className="hero-content container">
          <h1>Find your next adventure</h1>
          <p>Discover unique stays around the world — from city apartments to beachside villas.</p>
          <div className="hero-actions">
            <button className="btn btn-primary hero-cta" onClick={() => goToLocation('New York')}>
              Explore Homes
            </button>
            <button className="btn btn-outline-white" onClick={() => goToLocation('Bali')}>
              Discover Experiences
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Inspiration / Location Cards ────────────────────────────────── */}
      <section className="section inspiration-section container" aria-labelledby="inspiration-heading">
        <h2 id="inspiration-heading">Inspiration for your next trip</h2>
        <div className="inspiration-grid">
          {INSPIRATION_CARDS.map((card) => (
            <button
              key={card.city}
              className="inspiration-card"
              onClick={() => goToLocation(card.city)}
              aria-label={`Explore ${card.city}`}
            >
              <img src={card.img} alt={card.city} loading="lazy" />
              <div className="insp-info">
                <strong>{card.city}</strong>
                <span>{card.time}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── 3. Discover Airbnb Experiences ─────────────────────────────────── */}
      <section className="section experiences-section container" aria-labelledby="exp-heading">
        <h2 id="exp-heading">Discover Airbnb Experiences</h2>
        <div className="experiences-grid">
          {/* Things to do on your trip */}
          <div
            className="experience-card"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1543726969-a1da85a6d334?w=800)' }}
          >
            <div className="exp-card-content">
              <h3>Things to do on your trip</h3>
              <p>Make every day of your trip extraordinary with guided local experiences.</p>
              <button className="btn btn-primary" onClick={() => goToLocation('New York')}>
                Experiences
              </button>
            </div>
          </div>

          {/* Things to do at home */}
          <div
            className="experience-card"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800)' }}
          >
            <div className="exp-card-content">
              <h3>Things to do at home</h3>
              <p>Discover unique online experiences you can enjoy from the comfort of your home.</p>
              <button className="btn btn-primary" onClick={() => goToLocation('Bali')}>
                Online Experiences
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. ShopAirbnb ──────────────────────────────────────────────────── */}
      <section className="section shopairbnb-section" aria-labelledby="shop-heading">
        <div className="shopairbnb-inner container">
          <div className="shop-text">
            <span className="shop-eyebrow">Shop Airbnb</span>
            <h2 id="shop-heading">Give the gift of travel</h2>
            <p>Share the joy of unique stays with your loved ones. Airbnb gift cards never expire.</p>
            <button className="btn btn-primary" onClick={() => {}}>Shop gift cards</button>
          </div>
          <div className="shop-image">
            <img
              src="https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600"
              alt="Airbnb gift cards"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── 5. Future Getaways ─────────────────────────────────────────────── */}
      <section className="section getaways-section container" aria-labelledby="getaways-heading">
        <h2 id="getaways-heading">Inspiration for future getaways</h2>

        {/* Tabs */}
        <div className="getaways-tabs" role="tablist" aria-label="Getaway categories">
          {GETAWAYS_TABS.map((tab, i) => (
            <button
              key={tab.label}
              role="tab"
              aria-selected={activeTab === i}
              aria-controls={`tab-panel-${i}`}
              id={`tab-${i}`}
              className={`getaway-tab ${activeTab === i ? 'active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {GETAWAYS_TABS.map((tab, i) => (
          <div
            key={tab.label}
            id={`tab-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`tab-${i}`}
            hidden={activeTab !== i}
            className="getaway-panel"
          >
            <ul className="getaway-list">
              {tab.items.map((item) => {
                const [name, loc] = item.split(' – ');
                return (
                  <li key={item} className="getaway-item">
                    <div className="getaway-name">{name}</div>
                    <div className="getaway-loc">{loc}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
