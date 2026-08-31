/**
 * components/BackToTop/BackToTop.jsx
 * Floating "back to top" button that appears after scrolling 400px.
 * Accessible via keyboard and screen readers.
 */
import React, { useState, useEffect } from 'react';
import './BackToTop.css';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!visible) return null;

  return (
    <button
      className="back-to-top"
      onClick={scrollUp}
      aria-label="Back to top"
      title="Back to top"
    >
      ↑
    </button>
  );
};

export default BackToTop;
