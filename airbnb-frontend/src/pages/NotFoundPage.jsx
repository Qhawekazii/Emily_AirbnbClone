/**
 * pages/NotFoundPage.jsx
 * Friendly 404 page with navigation back home.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: 16, padding: 24,
      fontFamily: 'inherit', textAlign: 'center',
    }}>
      <div style={{ fontSize: '5rem' }}>🏠</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Page not found</h1>
      <p style={{ color: '#717171', maxWidth: 400 }}>
        Oops! The page you're looking for doesn't exist or may have moved.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '14px 28px', background: '#FF385C', color: 'white',
          border: 'none', borderRadius: 8, fontWeight: 700,
          fontSize: '1rem', cursor: 'pointer', marginTop: 8,
        }}
      >
        Back to Home
      </button>
    </div>
  );
};

export default NotFoundPage;
