/**
 * hooks/useLocalStorage.js
 * Drop-in replacement for useState that persists to localStorage.
 * Handles JSON serialisation and parse errors gracefully.
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - fallback when key not found
 */
import { useState } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.error('useLocalStorage error:', err);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
