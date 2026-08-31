/**
 * App.jsx — root routing for the Airbnb public frontend.
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LocationPage from './pages/LocationPage';
import LocationDetailsPage from './pages/LocationDetailsPage';

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/locations/:location" element={<LocationPage />} />
      <Route path="/listing/:id" element={<LocationDetailsPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  </AuthProvider>
);

export default App;
