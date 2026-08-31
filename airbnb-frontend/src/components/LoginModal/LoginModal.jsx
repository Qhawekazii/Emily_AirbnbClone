/**
 * components/LoginModal/LoginModal.jsx
 * Slide-up login/register modal used across the public frontend.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './LoginModal.css';

const LoginModal = ({ onClose }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Trap scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const validate = () => {
    const e = {};
    if (mode === 'register' && !form.username.trim()) e.username = 'Name is required';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'At least 6 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/users/login' : '/users/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;
      const res = await api.post(endpoint, payload);
      login(res.data.user, res.data.token);
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Login">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close" onClick={onClose} aria-label="Close login modal">✕</button>
          <h2>{mode === 'login' ? 'Log in' : 'Sign up'}</h2>
        </div>

        <div className="modal-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log in</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Sign up</button>
        </div>

        {serverError && <div className="modal-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="modal-field">
              <input name="username" type="text" placeholder="Full name"
                value={form.username} onChange={handleChange}
                className={errors.username ? 'err' : ''} autoComplete="name" />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>
          )}
          <div className="modal-field">
            <input name="email" type="email" placeholder="Email address"
              value={form.email} onChange={handleChange}
              className={errors.email ? 'err' : ''} autoComplete="email" />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="modal-field">
            <input name="password" type="password" placeholder="Password"
              value={form.password} onChange={handleChange}
              className={errors.password ? 'err' : ''} autoComplete="current-password" />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary modal-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <div className="modal-hint">
          <strong>Demo:</strong> john@example.com / password123
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
