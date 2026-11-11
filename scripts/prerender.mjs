// After `vite build` and the SSR build, write a ready-made HTML file for each public page.
// Cloudflare Pages serves dist/exams.html at /exams, so URLs stay the same.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { render } from '../dist-ssr/prerender.js';

const ROUTES = ['home', 'exams', 'jobs-govt', 'jobs-private', 'schools', 'explore', 'updates', 'about', 'privacy', 'terms'];
const template = readFileSync('dist/index.html', 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

for (const route of ROUTES) {
  const { html, title, description } = render(route);
  const url = 'https://margdisha.com' + (route === 'home' ? '/' : '/' + route);
  let page = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  if (!page.includes(html.slice(0, 40))) throw new Error('root placeholder not found for ' + route);
  writeFileSync(route === 'home' ? 'dist/index.html' : `dist/${route}.html`, page);
  console.log(`prerendered ${route}: ${Math.round(html.length / 1024)} KB`);
}
rmSync('dist-ssr', { recursive: true, force: true });
