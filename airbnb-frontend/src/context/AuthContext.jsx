/**
 * context/AuthContext.jsx
 * Global auth state for the public Airbnb frontend.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('airbnbUser');
    const t = localStorage.getItem('airbnbToken');
    if (u && t) { setUser(JSON.parse(u)); setToken(t); }
    setLoading(false);
  }, []);

  const login = (userData, jwt) => {
    setUser(userData); setToken(jwt);
    localStorage.setItem('airbnbUser', JSON.stringify(userData));
    localStorage.setItem('airbnbToken', jwt);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('airbnbUser');
    localStorage.removeItem('airbnbToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
