/**
 * context/AuthContext.jsx
 * Provides global authentication state across the admin app.
 * Persists user + token to localStorage for session continuity.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
  const storedUser = localStorage.getItem('adminUser');
  const storedToken = localStorage.getItem('adminToken');

  try {
    if (storedUser && storedToken && storedUser !== 'undefined') {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    } else {
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
    }
  } catch (error) {
    console.error('Failed to restore admin session:', error);

    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
  }

  setLoading(false);
}, []);


  const login = (userData, jwtToken) => {
  if (!userData || !jwtToken) {
    throw new Error('Login response did not contain user or token');
  }

  setUser(userData);
  setToken(jwtToken);

  localStorage.setItem('adminUser', JSON.stringify(userData));
  localStorage.setItem('adminToken', jwtToken);
};

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for convenient access
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
