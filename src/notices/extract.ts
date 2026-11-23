import type { JsonFeed, NoticeSource } from './sources';

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
  'citizen charter', 'archive', 'about us', 'home page', 'read more', 'user manual', 'how to fill', 'officers', 'who\'s who', 'telephone directory', 'budget',
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
export function pickNotices(links: FoundNotice[], source: Pick<NoticeSource, 'keywords' | 'linkMust'>, max = 25): FoundNotice[] {
  const kws = [...KEYWORDS, ...(source.keywords ?? [])].map((k) => k.toLowerCase());
  const seen = new Set<string>();
  const out: FoundNotice[] = [];
  for (const l of links) {
    const t = l.title.toLowerCase();
    if (l.title.length < 12 || l.title.length > 400 || l.title.split(' ').length < 3) continue;
    if (EXCLUDE.some((x) => t.includes(x))) continue;
    if (source.linkMust && !source.linkMust.some((m) => l.url.toLowerCase().includes(m.toLowerCase()))) continue;
    if (!kws.some((k) => t.includes(k) || l.url.toLowerCase().includes(k.replace(/\s+/g, '')))) continue;
    if (seen.has(l.url)) continue;
    seen.add(l.url);
    out.push({ title: l.title.slice(0, 300), url: l.url });
    if (out.length >= max) break;
  }
  return out;
}

const GOV_HOST = /\.(gov\.in|nic\.in|edu\.in|ac\.in)$/;
/** Last two labels of a host (three for .gov.in / .co.in style suffixes). */
const site = (host: string) => host.split('.').slice(/\.(gov|nic|co|org|ac|edu|net)\.in$/.test(host) ? -3 : -2).join('.');

/** Keep only links on the source's own site or another government / educational site (no news sites or ads). */
export function isOfficialLink(url: string, sourceUrl: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase(), s = new URL(sourceUrl).hostname.toLowerCase();
    return h === s || site(h) === site(s) || GOV_HOST.test(h);
  } catch { return false; }
}

const at = (o: unknown, path: string): unknown => path.split('.').filter(Boolean).reduce<unknown>((v, k) => (v && typeof v === 'object' ? (v as Record<string, unknown>)[k] : undefined), o);
const str = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '');

/** Notices from a JSON feed that a script-built page loads. */
export function noticesFromJson(body: unknown, feed: JsonFeed, max = 30): FoundNotice[] {
  const list = at(body, feed.items);
  if (!Array.isArray(list)) return [];
  const out: FoundNotice[] = [];
  for (const item of list) {
    const title = text(str(at(item, feed.title)));
    if (!title) continue;
    const prefix = feed.prefix ? str(at(item, feed.prefix)) : '';
    let link = (feed.link ?? []).map((f) => str(at(item, f))).find(Boolean) ?? '';
    if (!link && feed.linkTemplate) {
      // {field} or {a.0.b}; a value that is a file path ("uploads\\x\\y.pdf") keeps its folders.
      let missing = false;
      link = feed.linkTemplate.replace(/\{([\w.]+)\}/g, (_, f: string) => {
        const v = str(at(item, f)).replace(/\\/g, '/');
        if (!v) missing = true;
        return v.split('/').map(encodeURIComponent).join('/');
      });
      if (missing) link = '';
    }
    const url = link ? (() => { try { const u = new URL(link, feed.url); return /^https?:$/.test(u.protocol) ? u.toString() : null; } catch { return null; } })() : null;
    if (!url) continue;
    out.push({ title: (prefix && !title.toLowerCase().startsWith(prefix.toLowerCase()) ? `${prefix}: ${title}` : title).slice(0, 300), url });
    if (out.length >= max) break;
  }
  return out;
}

/** Each <tag>…</tag> heading on the page as a notice, linked to the page with a fragment made from its text,
 *  so the same notice keeps the same address on every visit (for sites whose own links change each time). */
export function headingNotices(html: string, pageUrl: string, tag: string): FoundNotice[] {
  const out: FoundNotice[] = [];
  for (const m of html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi'))) {
    const title = decode(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    if (!title) continue;
    let h = 5381; for (const c of title.toLowerCase()) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
    out.push({ title, url: `${pageUrl.split('#')[0]}#n${h.toString(36)}` });
  }
  return out;
}

/** The RRB website's menu: one link per notice type of each CEN (getdata?cennum=08/2026&...&category=Notification).
 *  Each CEN from `minYear` on, with its notice type, becomes one notice, e.g. "RRB CEN 08/2026 (Station Master): Notification". */
export function cenMenuNotices(links: FoundNotice[], minYear: number, names: Record<string, string> = {}): FoundNotice[] {
  const SKIP = /^(mock test link|objection tracker)$/i;
  const seen = new Set<string>(); const out: FoundNotice[] = [];
  for (const l of links) {
    const m = l.url.match(/[?&]cennum=(\d+\/(\d{4}))(?:&|$)/); const c = l.url.match(/[?&]category=([^&#]*)/);
    if (!m || !c) continue;
    const cat = decodeURIComponent(c[1].replace(/\+/g, ' ')).trim();
    if (!cat || SKIP.test(cat) || Number(m[2]) < minYear || seen.has(l.url)) continue;
    seen.add(l.url);
    out.push({ url: l.url, title: `RRB CEN ${m[1]}${names[m[1]] ? ` (${names[m[1]]})` : ''}: ${cat}` });
  }
  return out;
}
