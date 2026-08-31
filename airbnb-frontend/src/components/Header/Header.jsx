/**
 * components/Header/Header.jsx
 * Top header: logo, location filter search, profile section.
 * Shows login modal or user dropdown depending on auth state.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../LoginModal/LoginModal';
import './Header.css';

const LOCATIONS = ['New York', 'Paris', 'Cape Town', 'Tokyo', 'London', 'Bali'];

const Header = ({ transparent = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [filterValue, setFilterValue] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = LOCATIONS.filter((l) =>
    l.toLowerCase().includes(filterValue.toLowerCase())
  );

  const handleSearch = (loc) => {
    setFilterValue(loc);
    setShowSuggestions(false);
    navigate(`/locations/${encodeURIComponent(loc)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const match = LOCATIONS.find((l) => l.toLowerCase() === filterValue.toLowerCase());
    if (match) handleSearch(match);
    else if (filtered.length > 0) handleSearch(filtered[0]);
  };

  const handleLogout = () => { logout(); setDropdownOpen(false); navigate('/'); };

  return (
    <>
      <header className={`header ${transparent ? 'header-transparent' : ''}`}>
        <div className="header-inner container">
          {/* Logo */}
          <button className="header-logo" onClick={() => navigate('/')} aria-label="Go to home">
            <svg viewBox="0 0 32 32" className="logo-svg" aria-hidden="true">
              <path d="M16 1C9.925 1 5 6.149 5 12.5c0 4.243 2.338 8.67 4.613 11.937A46.91 46.91 0 0016 31a46.91 46.91 0 006.387-6.563C24.662 21.17 27 16.743 27 12.5 27 6.149 22.075 1 16 1zm0 16a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" fill="#FF385C" />
            </svg>
            <span className="logo-text">airbnb</span>
          </button>

          {/* Search / Filter */}
          <div className="header-search" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} role="search" aria-label="Search locations">
              <div className="search-bar">
                <span className="search-icon" aria-hidden="true">🔍</span>
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={filterValue}
                  onChange={(e) => { setFilterValue(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  aria-label="Search destinations"
                  aria-autocomplete="list"
                  aria-controls="location-suggestions"
                  aria-expanded={showSuggestions}
                />
                <button type="submit" className="search-btn" aria-label="Search">
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && filtered.length > 0 && (
              <ul className="search-suggestions" id="location-suggestions" role="listbox">
                {filtered.map((loc) => (
                  <li
                    key={loc}
                    role="option"
                    onClick={() => handleSearch(loc)}
                    className="suggestion-item"
                  >
                    <span className="suggestion-icon" aria-hidden="true">📍</span>
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Profile section */}
          <div className="header-profile">
            {!user && (
              <button className="become-host-link" onClick={() => setShowLogin(true)}>
                Become a host
              </button>
            )}

            <div className="profile-btn-wrap" ref={dropdownRef}>
              <button
                className="profile-btn"
                onClick={() => user ? setDropdownOpen((p) => !p) : setShowLogin(true)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                aria-label="User menu"
              >
                <span className="hamburger" aria-hidden="true">☰</span>
                <span className="profile-avatar" aria-hidden="true">
                  {user ? user.username.charAt(0).toUpperCase() : '👤'}
                </span>
              </button>

              {dropdownOpen && user && (
                <div className="profile-dropdown" role="menu">
                  <div className="dropdown-user-info">
                    <strong>{user.username}</strong>
                    <small>{user.email}</small>
                  </div>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item" role="menuitem" onClick={() => { navigate('/reservations'); setDropdownOpen(false); }}>
                    My Reservations
                  </button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" role="menuitem" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default Header;
