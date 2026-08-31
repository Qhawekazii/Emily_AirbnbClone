/**
 * hooks/useFetch.js
 * Generic data-fetching hook with loading, error, and abort support.
 * Automatically cancels the request if the component unmounts.
 *
 * @param {string} url - endpoint to fetch (relative to /api)
 * @param {object} options - optional axios config
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch('/accommodations');
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Cancel any previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await api.get(url, {
        ...options,
        signal: abortRef.current.signal,
      });
      setData(res.data);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    fetchData();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
