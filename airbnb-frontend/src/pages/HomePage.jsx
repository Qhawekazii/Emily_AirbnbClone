/**
 * pages/HomePage.jsx
 * Airbnb Home Page — matches screenshots exactly:
 *  1. Hero Banner
 *  2. Inspiration for your next trip (location cards grid)
 *  3. Discover Airbnb Experiences (2 full-width image cards)
 *  4. Shop Airbnb gift cards (text left, stacked cards right)
 *  5. Questions about hosting? (full-width dark image + CTA)
 *  6. Inspiration for future getaways (tabs + 5-column city grid)
 *  7. Footer
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import BackToTop from '../components/BackToTop/BackToTop';
import './HomePage.css';

// ── Data ──────────────────────────────────────────────────────────────────────
const INSPIRATION_CARDS = [
  { city: 'New York',   time: '2 hours away',  img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&q=80' },
  { city: 'Cape Town',  time: '10 hours away', img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=300&q=80' },
  { city: 'Paris',      time: '8 hours away',  img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=300&q=80' },
  { city: 'Tokyo',      time: '14 hours away', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&q=80' },
  { city: 'London',     time: '11 hours away', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300&q=80' },
  { city: 'Bali',       time: '16 hours away', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&q=80' },
  { city: 'Sydney',     time: '20 hours away', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=300&q=80' },
  { city: 'Dubai',      time: '9 hours away',  img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300&q=80' },
];

// Getaways tabs — matches screenshot: city name bold, state/country below
const GETAWAYS_TABS = [
  {
    label: 'Destinations for arts & culture',
    cols: [
      [{ city: 'Phoenix',       sub: 'Arizona' },     { city: 'San Francisco', sub: 'California' }, { city: 'Keswick',       sub: 'England' }],
      [{ city: 'Hot Springs',   sub: 'Arkansas' },    { city: 'Barcelona',     sub: 'Catalonia' },   { city: 'London',        sub: 'England' }],
      [{ city: 'Los Angeles',   sub: 'California' },  { city: 'Prague',        sub: 'Czechia' },     { city: 'Scarborough',   sub: 'England' }],
      [{ city: 'San Diego',     sub: 'California' },  { city: 'Washington',    sub: 'District of Columbia' }, { city: 'Johannesburg', sub: 'Gauteng' }],
    ],
  },
  {
    label: 'Destinations for outdoor adventure',
    cols: [
      [{ city: 'Queenstown',    sub: 'New Zealand' }, { city: 'Banff',         sub: 'Alberta' },     { city: 'Moab',          sub: 'Utah' }],
      [{ city: 'Zermatt',       sub: 'Switzerland' }, { city: 'Interlaken',    sub: 'Switzerland' }, { city: 'Patagonia',     sub: 'Argentina' }],
      [{ city: 'Cape Town',     sub: 'South Africa' },{ city: 'Reykjavik',     sub: 'Iceland' },     { city: 'Whistler',      sub: 'Canada' }],
      [{ city: 'Milford Sound', sub: 'New Zealand' }, { city: 'Torres del Paine', sub: 'Chile' },    { city: 'Yosemite',      sub: 'California' }],
    ],
  },
  {
    label: 'Mountain cabins',
    cols: [
      [{ city: 'Asheville',     sub: 'North Carolina' }, { city: 'Gatlinburg', sub: 'Tennessee' },  { city: 'Lake Tahoe',    sub: 'California' }],
      [{ city: 'Breckenridge',  sub: 'Colorado' },    { city: 'Jackson Hole',  sub: 'Wyoming' },    { city: 'Sedona',        sub: 'Arizona' }],
      [{ city: 'Blue Ridge',    sub: 'Georgia' },     { city: 'Estes Park',    sub: 'Colorado' },   { city: 'Flagstaff',     sub: 'Arizona' }],
      [{ city: 'Big Bear',      sub: 'California' },  { city: 'Telluride',     sub: 'Colorado' },   { city: 'Park City',     sub: 'Utah' }],
    ],
  },
  {
    label: 'Beach destinations',
    cols: [
      [{ city: 'Miami',         sub: 'Florida' },     { city: 'Malibu',        sub: 'California' }, { city: 'Tulum',         sub: 'Mexico' }],
      [{ city: 'Maui',          sub: 'Hawaii' },      { city: 'Ibiza',         sub: 'Spain' },      { city: 'Mykonos',       sub: 'Greece' }],
      [{ city: 'Bali',          sub: 'Indonesia' },   { city: 'Phuket',        sub: 'Thailand' },   { city: 'Zanzibar',      sub: 'Tanzania' }],
      [{ city: 'Amalfi Coast',  sub: 'Italy' },       { city: 'Santorini',     sub: 'Greece' },     { city: 'Maldives',      sub: 'Indian Ocean' }],
    ],
  },
  {
    label: 'Popular destinations',
    cols: [
      [{ city: 'New York',      sub: 'New York' },    { city: 'Las Vegas',     sub: 'Nevada' },     { city: 'London',        sub: 'England' }],
      [{ city: 'Paris',         sub: 'France' },      { city: 'Tokyo',         sub: 'Japan' },      { city: 'Dubai',         sub: 'UAE' }],
      [{ city: 'Barcelona',     sub: 'Spain' },       { city: 'Rome',          sub: 'Italy' },      { city: 'Sydney',        sub: 'Australia' }],
      [{ city: 'Amsterdam',     sub: 'Netherlands' }, { city: 'Prague',        sub: 'Czechia' },    { city: 'Lisbon',        sub: 'Portugal' }],
    ],
  },
  {
    label: 'Unique Stays',
    cols: [
      [{ city: 'Treehouses',    sub: 'Worldwide' },   { city: 'Houseboats',    sub: 'Amsterdam' },  { city: 'Ice Hotels',    sub: 'Sweden' }],
      [{ city: 'Caves',         sub: 'Cappadocia' },  { city: 'Castles',       sub: 'Scotland' },   { city: 'Lighthouses',   sub: 'Maine' }],
      [{ city: 'Yurts',         sub: 'Mongolia' },    { city: 'Windmills',     sub: 'Netherlands' },{ city: 'Igloos',        sub: 'Finland' }],
      [{ city: 'Tiny Homes',    sub: 'Oregon' },      { city: 'Hobbit Holes',  sub: 'New Zealand' },{ city: 'Floating Villas', sub: 'Maldives' }],
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
const HomePage = () => {
  const navigate    = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const goTo = (city) => navigate(`/locations/${encodeURIComponent(city)}`);

  return (
    <div className="hp-page">
      <Header transparent />

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="hp-hero" aria-label="Hero banner">
        <div
          className="hp-hero-bg"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80)' }}
        />
        <div className="hp-hero-overlay" />
        <div className="hp-hero-content hp-container">
          <h1>Find places to stay on Airbnb</h1>
          <p>Discover entire homes and rooms perfect for any trip.</p>
          <div className="hp-hero-actions">
            <button className="hp-btn-primary" onClick={() => goTo('New York')}>
              Explore nearby stays
            </button>
            <button className="hp-btn-outline" onClick={() => goTo('Bali')}>
              Discover experiences
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Inspiration ──────────────────────────────────────────────── */}
      <section className="hp-section hp-container" aria-labelledby="insp-heading">
        <h2 id="insp-heading" className="hp-section-title">Inspiration for your next trip</h2>
        <div className="hp-inspiration-grid">
          {INSPIRATION_CARDS.map((card) => (
            <button
              key={card.city}
              className="hp-insp-card"
              onClick={() => goTo(card.city)}
              aria-label={`Explore ${card.city}`}
            >
              <img src={card.img} alt={card.city} loading="lazy" />
              <div className="hp-insp-info">
                <strong>{card.city}</strong>
                <span>{card.time}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── 3. Discover Experiences ─────────────────────────────────────── */}
      <section className="hp-section hp-container" aria-labelledby="exp-heading">
        <h2 id="exp-heading" className="hp-section-title">Discover Airbnb Experiences</h2>
        <div className="hp-exp-grid">
          <div
            className="hp-exp-card"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1543726969-a1da85a6d334?w=800&q=80)' }}
            role="button"
            tabIndex={0}
            onClick={() => goTo('New York')}
          >
            <div className="hp-exp-body">
              <h3>Things to do on your trip</h3>
              <button className="hp-exp-btn" onClick={(e) => { e.stopPropagation(); goTo('New York'); }}>
                Experiences
              </button>
            </div>
          </div>
          <div
            className="hp-exp-card"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80)' }}
            role="button"
            tabIndex={0}
            onClick={() => goTo('Bali')}
          >
            <div className="hp-exp-body">
              <h3>Things to do from home</h3>
              <button className="hp-exp-btn" onClick={(e) => { e.stopPropagation(); goTo('Bali'); }}>
                Online Experiences
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Shop Airbnb gift cards ────────────────────────────────────── */}
      <section className="hp-shop-section" aria-labelledby="shop-heading">
        <div className="hp-shop-inner hp-container">
          <div className="hp-shop-text">
            <h2 id="shop-heading">Shop Airbnb<br />gift cards</h2>
            <button className="hp-shop-btn">Learn more</button>
          </div>
          <div className="hp-shop-cards" aria-hidden="true">
            {/* Stacked gift card visuals matching screenshot */}
            <div className="hp-gift-card hp-gc-back hp-gc-purple">
              <div className="hp-gc-logo">
                <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
                  <path d="M16 1C9.925 1 5 6.149 5 12.5c0 4.243 2.338 8.67 4.613 11.937A46.91 46.91 0 0016 31a46.91 46.91 0 006.387-6.563C24.662 21.17 27 16.743 27 12.5 27 6.149 22.075 1 16 1zm0 16a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
                </svg>
              </div>
            </div>
            <div className="hp-gift-card hp-gc-front hp-gc-pink">
              <div className="hp-gc-logo">
                <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
                  <path d="M16 1C9.925 1 5 6.149 5 12.5c0 4.243 2.338 8.67 4.613 11.937A46.91 46.91 0 0016 31a46.91 46.91 0 006.387-6.563C24.662 21.17 27 16.743 27 12.5 27 6.149 22.075 1 16 1zm0 16a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Questions about hosting ───────────────────────────────────── */}
      <section className="hp-hosting-section hp-container" aria-labelledby="host-heading">
        <div
          className="hp-hosting-card"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=900&q=80)' }}
        >
          <div className="hp-hosting-overlay" />
          <div className="hp-hosting-body">
            <h2 id="host-heading">Questions about<br />hosting?</h2>
            <button className="hp-hosting-btn">Ask a Superhost</button>
          </div>
        </div>
      </section>

      {/* ── 6. Inspiration for future getaways ──────────────────────────── */}
      <section className="hp-section hp-getaways-section hp-container" aria-labelledby="getaways-heading">
        <h2 id="getaways-heading" className="hp-section-title">Inspiration for future getaways</h2>

        {/* Tabs */}
        <div className="hp-tabs" role="tablist" aria-label="Getaway categories">
          {GETAWAYS_TABS.map((tab, i) => (
            <button
              key={tab.label}
              role="tab"
              aria-selected={activeTab === i}
              aria-controls={`hp-tabpanel-${i}`}
              id={`hp-tab-${i}`}
              className={`hp-tab ${activeTab === i ? 'hp-tab-active' : ''}`}
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
            id={`hp-tabpanel-${i}`}
            role="tabpanel"
            aria-labelledby={`hp-tab-${i}`}
            hidden={activeTab !== i}
            className="hp-tab-panel"
          >
            <div className="hp-getaways-grid">
              {tab.cols.map((col, ci) => (
                <div key={ci} className="hp-getaways-col">
                  {col.map((item) => (
                    <div
                      key={item.city}
                      className="hp-getaway-item"
                      role="button"
                      tabIndex={0}
                      onClick={() => goTo(item.city)}
                      onKeyDown={(e) => e.key === 'Enter' && goTo(item.city)}
                    >
                      <span className="hp-getaway-city">{item.city}</span>
                      <span className="hp-getaway-sub">{item.sub}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button className="hp-show-more">Show more</button>
          </div>
        ))}
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default HomePage;
