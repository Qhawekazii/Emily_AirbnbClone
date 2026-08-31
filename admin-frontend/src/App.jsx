/**
 * App.jsx
 * Root component — wraps the app in AuthProvider and defines all routes.
 * Protected routes redirect to /login if not authenticated.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateListingPage from './pages/CreateListingPage';
import ViewListingsPage from './pages/ViewListingsPage';
import UpdateListingPage from './pages/UpdateListingPage';
import ReservationsPage from './pages/ReservationsPage';

// Guard: redirects unauthenticated users to /login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      {user && <Header />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/listings" element={<PrivateRoute><ViewListingsPage /></PrivateRoute>} />
        <Route path="/listings/create" element={<PrivateRoute><CreateListingPage /></PrivateRoute>} />
        <Route path="/listings/edit/:id" element={<PrivateRoute><UpdateListingPage /></PrivateRoute>} />
        <Route path="/reservations" element={<PrivateRoute><ReservationsPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
