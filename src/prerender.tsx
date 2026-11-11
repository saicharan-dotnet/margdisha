/**
 * Build-time prerender: renders a route to static HTML so search engines and the AdSense
 * reviewer see the full page content before any JavaScript runs. The browser then renders the
 * live app over it (main.tsx), so this only affects the first paint and crawlers.
 */
import { renderToString } from 'react-dom/server';
import { App, META } from './App';

export function render(route: string): { html: string; title: string; description: string } {
  const path = route === 'home' ? '/' : '/' + route;
  (globalThis as unknown as { window: unknown }).window = {
    location: { pathname: path, search: '', hash: '', protocol: 'https:', origin: 'https://margdisha.com', href: 'https://margdisha.com' + path },
  };
  const html = renderToString(<App />);
  const [title, description] = META[route] ?? META.home;
  return { html, title, description };
}
