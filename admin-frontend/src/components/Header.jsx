/**
 * components/Header.jsx
 * Top navigation header for the admin dashboard.
 * Shows logo, nav links, user greeting, and dropdown menu when logged in.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-inner container">
        {/* Logo */}
        <Link to="/" className="header-logo" aria-label="Airbnb Admin Home">
          <svg viewBox="0 0 32 32" className="logo-svg" aria-hidden="true">
            <path
              d="M16 1C9.925 1 5 6.149 5 12.5c0 4.243 2.338 8.67 4.613 11.937A46.91 46.91 0 0016 31a46.91 46.91 0 006.387-6.563C24.662 21.17 27 16.743 27 12.5 27 6.149 22.075 1 16 1zm0 16a4.5 4.5 0 110-9 4.5 4.5 0 010 9z"
              fill="#FF385C"
            />
          </svg>
          <span>Admin</span>
        </Link>

        {/* Nav links */}
        <nav className="header-nav" aria-label="Main navigation">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Dashboard</Link>
          <Link to="/listings" className={`nav-link ${isActive('/listings') ? 'active' : ''}`}>Listings</Link>
          <Link to="/listings/create" className={`nav-link ${isActive('/listings/create') ? 'active' : ''}`}>+ New Listing</Link>
          <Link to="/reservations" className={`nav-link ${isActive('/reservations') ? 'active' : ''}`}>Reservations</Link>
        </nav>

        {/* User area */}
        <div className="header-user">
          {user ? (
            <div className="user-dropdown" ref={dropdownRef}>
              {/* Greeting */}
              <span className="user-greeting">Hello, {user.username}</span>

              {/* Profile icon button */}
              <button
                className="profile-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <span className="profile-avatar" aria-hidden="true">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="dropdown-menu" role="menu">
                  <Link
                    to="/reservations"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    View Reservations
                  </Link>
                  <Link
                    to="/listings"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Listings
                  </Link>
                  <hr className="dropdown-divider" />
                  <button
                    className="dropdown-item dropdown-logout"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">Log In</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
