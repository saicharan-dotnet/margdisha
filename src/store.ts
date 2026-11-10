import { useCallback, useEffect, useState } from 'react';

/**
 * Phase 1 persistence: browser storage only. Phase 2 replaces this with the API
 * (Postgres) so profiles, saved items and admin reviews are stored server-side.
 */
export function usePersisted<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem('margdisha:' + key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem('margdisha:' + key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }, [key, value]);
  return [value, useCallback((v) => setValue(v), [])];
}

/** Clean page addresses (margdisha.com/schools) so Google can list each page. A file:// demo keeps #hash addresses. */
const HASH_MODE = typeof window !== 'undefined' && window.location.protocol === 'file:';
const OLD_HASH = /^#\/?([a-z][a-z0-9-]*(\?.*)?)$/i;

export const hrefFor = (r: string) => (HASH_MODE ? '#' + r : '/' + (r === 'home' ? '' : r));

function readRoute() {
  const { pathname, search, hash } = window.location;
  if (HASH_MODE) return hash.replace(/^#\/?/, '') || 'home';
  const p = pathname.replace(/^\/+|\/+$/g, '');
  if (p === 'search') return 'search' + search;
  return p || 'home';
}

export function useHashRoute(): [string, (r: string) => void] {
  const [route, setRoute] = useState(() => {
    // Old links like margdisha.com/#schools move to margdisha.com/schools.
    const m = !HASH_MODE && OLD_HASH.exec(window.location.hash);
    if (m) window.history.replaceState(null, '', hrefFor(m[1]));
    return readRoute();
  });
  const go = useCallback((r: string) => {
    if (HASH_MODE) { window.location.hash = r; return; }
    if (hrefFor(r) !== window.location.pathname + window.location.search) window.history.pushState(null, '', hrefFor(r));
    setRoute(readRoute());
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    const on = () => {
      const m = !HASH_MODE && OLD_HASH.exec(window.location.hash);
      if (m) window.history.replaceState(null, '', hrefFor(m[1]));
      setRoute(readRoute()); window.scrollTo(0, 0);
    };
    if (!HASH_MODE) window.addEventListener('hashchange', on);
    window.addEventListener(HASH_MODE ? 'hashchange' : 'popstate', on);
    // Same-site links (<a href="/schools">) change the page without a reload.
    const click = (e: MouseEvent) => {
      if (HASH_MODE || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.('a');
      const href = a?.getAttribute('href');
      if (!a || !href || !href.startsWith('/') || href.startsWith('//') || a.target) return;
      e.preventDefault();
      go(href.slice(1) || 'home');
    };
    document.addEventListener('click', click);
    return () => { window.removeEventListener(HASH_MODE ? 'hashchange' : 'popstate', on); window.removeEventListener('hashchange', on); document.removeEventListener('click', click); };
  }, [go]);
  return [route, go];
}
