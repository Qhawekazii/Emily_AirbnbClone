/**
 * components/ErrorBoundary.jsx
 * React class component that catches render errors and shows a fallback UI.
 */
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '60vh', gap: 16, padding: 24,
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Something went wrong</h2>
          <p style={{ color: '#717171', textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px', background: '#FF385C', color: 'white',
              border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
