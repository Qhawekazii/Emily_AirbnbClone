/**
 * hooks/useScrollToTop.js
 * Scrolls the window to the top on every route change.
 * Import and call inside any page component or the App root.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
};

export default useScrollToTop;
