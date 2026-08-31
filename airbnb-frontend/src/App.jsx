/**
 * App.jsx — root routing for the Airbnb public frontend.
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useScrollToTop from './hooks/useScrollToTop';
import HomePage from './pages/HomePage';
import LocationPage from './pages/LocationPage';
import LocationDetailsPage from './pages/LocationDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

const ScrollToTop = () => { useScrollToTop(); return null; };

const App = () => (
  <AuthProvider>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/locations/:location" element={<LocationPage />} />
      <Route path="/listing/:id" element={<LocationDetailsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </AuthProvider>
);

export default App;
