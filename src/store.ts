import { useCallback, useEffect, useState } from 'react';

/**
 * Phase 1 persistence: browser storage only. Phase 2 replaces this with the API
 * (Postgres) so profiles, saved items and admin reviews are stored server-side.
 */
export function usePersisted<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem('nextstep:' + key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem('nextstep:' + key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }, [key, value]);
  return [value, useCallback((v) => setValue(v), [])];
}

export function useHashRoute(): [string, (r: string) => void] {
  const read = () => window.location.hash.replace(/^#\/?/, '') || 'home';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return [route, (r) => { window.location.hash = '/' + r; }];
}
