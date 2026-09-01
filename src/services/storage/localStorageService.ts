/**
 * Safe client-side LocalStorage wrapper.
 */

export const localStorageService = {
  getItem<T>(key: string, fallback: T): T {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return fallback;
      }
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`Failed to read key "${key}" from localStorage:`, err);
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Failed to write key "${key}" to localStorage:`, err);
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`Failed to remove key "${key}" from localStorage:`, err);
      return false;
    }
  },

  clear(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.clear();
      return true;
    } catch (err) {
      console.error('Failed to clear localStorage:', err);
      return false;
    }
  }
};
