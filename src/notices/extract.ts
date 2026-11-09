import type { NoticeSource } from './sources';

export interface FoundNotice { title: string; url: string }

const KEYWORDS = [
  'recruit', 'notification', 'notice', 'advertisement', 'advt', 'vacanc', 'exam', 'admission', 'apply', 'application',
  'result', 'admit card', 'answer key', 'selection', 'walk-in', 'walk in', 'engagement', 'entrance', 'post', 'apprentice',
  'schedule', 'merit list', 'registration', 'cet', 'interview', 'call letter', 'syllabus', 'corrigendum', 'addendum',
];
const EXCLUDE = [
  'tender', 'rti', 'annual report', 'login', 'sign in', 'sitemap', 'site map', 'contact', 'privacy', 'copyright', 'disclaimer',
  'feedback', 'faq', 'gallery', 'photo', 'video', 'twitter', 'facebook', 'youtube', 'instagram', 'linkedin', 'screen reader',
  'skip to', 'accessibility', 'hyperlink', 'terms', 'web information manager', 'help desk', 'helpdesk', 'grievance',
  'citizen charter', 'archive', 'about us', 'home page', 'officers', 'who\'s who', 'telephone directory', 'budget',
];
const GENERIC = /^(click here|here|download|view|view more|read more|more|details|pdf|link|open|new|apply|apply online|english|hindi|हिन्दी)$/i;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘' };
export const decode = (s: string) =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
export const text = (html: string) => decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Resolve a link against the page; keep only http(s) links, drop fragments. */
export function resolve(href: string, base: string): string | null {
  const h = decode(href.trim());
  if (!h || /^(javascript|mailto|tel|data):/i.test(h) || h.startsWith('#')) return null;
  try {
    const u = new URL(h, base);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    u.hash = '';
    return u.toString();
  } catch { return null; }
}

/**
 * Pull every link out of a page with a readable title. When the link text is generic
 * ("Click here", "Download"), the title comes from the surrounding table row or list item.
 */
export function extractLinks(html: string, base: string): FoundNotice[] {
  const clean = html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  const blocks = clean.split(/<\/(?:tr|li|p|h[1-6])>/i);
  const out: FoundNotice[] = [];
  for (const block of blocks) {
    const anchors = [...block.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
    if (!anchors.length) continue;
    const blockText = text(block);
    for (const [, attrs, inner] of anchors) {
      const href = /href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
      if (!href) continue;
      const url = resolve(href[2] ?? href[3] ?? href[4] ?? '', base);
      if (!url) continue;
      let title = text(inner).replace(/\(\s*\d+(\.\d+)?\s*(kb|mb)\s*\)/gi, '').trim();
      if (!title || GENERIC.test(title) || title.length < 8) {
        const attrTitle = /title\s*=\s*"([^"]*)"/i.exec(attrs)?.[1];
        title = attrTitle && !GENERIC.test(attrTitle) ? text(attrTitle) : (anchors.length === 1 ? blockText : title);
      }
      title = title.replace(/\b(click here|download|view)\b/gi, '').replace(/\(\s*\d+(\.\d+)?\s*(kb|mb)\s*\)/gi, '').replace(/\s+/g, ' ').replace(/^[\s\-–:|•]+|[\s\-–:|•]+$/g, '');
      out.push({ title, url });
    }
  }
  return out;
}

/** Keep links that look like recruitment or admission notices, newest-first as the page lists them. */
export function pickNotices(links: FoundNotice[], source: Pick<NoticeSource, 'keywords'>, max = 25): FoundNotice[] {
  const kws = [...KEYWORDS, ...(source.keywords ?? [])].map((k) => k.toLowerCase());
  const seen = new Set<string>();
  const out: FoundNotice[] = [];
  for (const l of links) {
    const t = l.title.toLowerCase();
    if (l.title.length < 12 || l.title.length > 400 || l.title.split(' ').length < 3) continue;
    if (EXCLUDE.some((x) => t.includes(x))) continue;
    if (!kws.some((k) => t.includes(k) || l.url.toLowerCase().includes(k.replace(/\s+/g, '')))) continue;
    if (seen.has(l.url)) continue;
    seen.add(l.url);
    out.push({ title: l.title.slice(0, 300), url: l.url });
    if (out.length >= max) break;
  }
  return out;
}
