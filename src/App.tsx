import { SITE } from './site-config';
import { useEffect, useMemo, useState } from 'react';
import { Ctx, translator, type AppState } from './app-context';
import type { Opportunity, OpportunityKind, Profile as P } from './data/types';
import { SEED_OPPORTUNITIES } from './data/seed';
import { checkIsAdmin, deleteOpportunity, fetchNotices, fetchOpportunities, setNoticeStatus as setNoticeStatusRemote, type Notice, loadUserData, saveOpportunity, saveProfileRemote, setSavedRemote } from './data/remote';
import { supabase } from './lib/supabase';
import { LANG_NAMES, type Key, type Lang } from './i18n/strings';
import { usePersisted, useHashRoute, hrefFor } from './store';
import { Icon, type IconName } from './components/Icon';
import { Logo } from './components/Logo';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Profile } from './pages/Profile';
import { Matches } from './pages/Matches';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { Jobs } from './pages/Jobs';
import { Schools } from './pages/Schools';
import { Updates } from './pages/Updates';
import { Search } from './pages/Search';
import { About, Privacy, Terms } from './pages/Info';
import { Exams } from './pages/Exams';

/** [route, label, icon, shown in the mobile tab bar] */
const NAV: [string, Key, IconName, boolean][] = [
  ['home', 'navHome', 'home', true], ['explore', 'navExplore', 'compass', true], ['exams', 'navExams', 'exam', true], ['jobs-govt', 'navJobs', 'briefcase', true],
  ['schools', 'navSchools', 'school', true], ['matches', 'navMatches', 'check', false], ['dashboard', 'navDashboard', 'user', false],
];

function page(route: string) {
  if (route.startsWith('search')) {
    let q = route.split('q=')[1] ?? '';
    try { q = decodeURIComponent(q); } catch { /* keep raw */ }
    return <Search key={q} initial={q} />;
  }
  if (route.startsWith('jobs')) return <Jobs tab={route === 'jobs-private' ? 'private' : 'govt'} />;
  if (route.startsWith('matches')) {
    const k = route.slice('matches-'.length) as OpportunityKind;
    return <Matches key={route} initialKind={route.includes('-') ? k : 'all'} />;
  }
  switch (route) {
    case 'explore': return <Explore />;
    case 'profile': return <Profile />;
    case 'dashboard': return <Dashboard />;
    case 'admin': return <Admin />;
    case 'schools': return <Schools />;
    case 'updates': return <Updates />;
    case 'exams': return <Exams />;
    case 'about': return <About />;
    case 'privacy': return <Privacy />;
    case 'terms': return <Terms />;
    default: return <Home />;
  }
}
const section = (r: string) => r.split('-')[0];

/** Page title and Google description for each page. */
export const META: Record<string, [string, string]> = {
  home: ['MargDisha: courses, jobs, scholarships and school admissions in India',
    'Find what to study after 10th, 12th or a degree, government and private jobs, scholarships, entrance exams and school admissions such as Navodaya, Sainik, Kendriya Vidyalaya and Gurukul. Free, in English, Telugu and Hindi.'],
  explore: ['What to study next after 10th, 12th, diploma or degree | MargDisha',
    'Courses and careers you can choose after Class 10, Intermediate (MPC, BiPC, MEC, CEC), diploma, B.Tech, B.Sc, B.Com, B.A. and more.'],
  'jobs-govt': ['Government jobs: UPSC, SSC, Railways, Banks, PSUs, TG and AP | MargDisha',
    'When forms usually open, who can apply and how to apply for UPSC, SSC, RRB, IBPS, SBI, TGPSC, APPSC, police, teachers, BHEL, DRDO, ISRO, doctors and nurses, TTD and more.'],
  exams: ['Entrance exams after 10th, Inter and degree: JEE, EAPCET, NEET, POLYCET, GATE | MargDisha',
    'How to apply for JEE Main, JEE Advanced, TG and AP EAPCET, NEET, POLYCET, RGUKT IIIT, ECET, GATE, ICET and more, what each gets you, and how to get into IITs, NITs and IIITs.'],
  'jobs-private': ['Private jobs by qualification and sector | MargDisha', 'Private jobs, apprenticeships and internships for 10th, ITI, 12th, diploma, degree and B.Tech: typical jobs, selection and how to apply.'],
  schools: ['School admissions: Navodaya, Sainik, KV, Gurukul | MargDisha',
    'When admission forms open for Kendriya Vidyalaya Class 1, Gurukul Class 5 (TGCET, AP), Navodaya Class 6 and 9, Sainik and Military Schools, EMRS and the NMMS scholarship.'],
  matches: ['Scholarships, entrance exams and opportunities for you | MargDisha', 'Scholarships, entrance exams, skill courses and study abroad options that match your qualification.'],
  'matches-scholarship': ['Scholarships for students in India | MargDisha', 'Central, Telangana, Andhra Pradesh and private scholarships with eligibility and last dates.'],
  'matches-exam': ['Entrance exams after 10th and 12th | MargDisha', 'Entrance exams for engineering, medical, polytechnic, degree and government courses.'],
  updates: ['Latest updates from official websites | MargDisha', 'New notices collected automatically from official government websites every few hours.'],
  about: ['About MargDisha', 'What MargDisha is, where its information comes from, and how to contact us.'],
  privacy: ['Privacy policy | MargDisha', 'What information MargDisha collects, how cookies and ads work, and your choices.'],
  terms: ['Terms of use | MargDisha', 'Terms for using MargDisha.'],
  search: ['Search | MargDisha', 'Search jobs, exams, schools and scholarships.'],
};
function useMeta(route: string) {
  useEffect(() => {
    const key = route.split('?')[0];
    const [title, desc] = META[key] ?? META[section(key)] ?? META.home;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
    const canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute('href', 'https://margdisha.com' + (META[key] ? (key === 'home' ? '/' : '/' + key) : '/'));
    // Personal pages (profile, admin, dashboard), search results and the per-profile matches
    // pages (empty until listings are verified) stay out of Google.
    document.querySelector('meta[name="robots"]')?.setAttribute('content', META[key] && key !== 'search' && !key.startsWith('matches') ? 'index,follow' : 'noindex,follow');
  }, [route]);
}
const upsert = (list: Opportunity[], o: Opportunity) => (list.some((x) => x.id === o.id) ? list.map((x) => (x.id === o.id ? o : x)) : [o, ...list]);

type Theme = 'light' | 'dark';
const systemTheme = (): Theme => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

/** Light or dark appearance: follows the phone's setting until the visitor picks one. */
function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    try { const v = localStorage.getItem('margdisha:theme'); if (v === 'light' || v === 'dark') return v; } catch { /* storage blocked */ }
    return systemTheme();
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#253634' : '#ffffff');
  }, [theme]);
  const toggle = () => setTheme((t) => {
    const next = t === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('margdisha:theme', next); } catch { /* storage blocked */ }
    return next;
  });
  return [theme, toggle];
}

export function App() {
  const [route, go] = useHashRoute();
  const [theme, toggleTheme] = useTheme();
  useMeta(route);
  const [lang, setLang] = usePersisted<Lang>('lang', 'en');
  const [profile, setProfileLocal] = usePersisted<P>('profile', { skills: [], interests: [] });
  const [localOpps, setLocalOpps] = usePersisted<Opportunity[]>('opps-v3', SEED_OPPORTUNITIES);
  const [saved, setSaved] = usePersisted<string[]>('saved', []);
  const [remoteOpps, setRemoteOpps] = useState<Opportunity[] | null>(null);
  const [source, setSource] = useState<'db' | 'local' | 'loading'>(supabase ? 'loading' : 'local');
  const [user, setUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const t = useMemo(() => translator(lang), [lang]);

  // Load opportunities from the database; fall back to bundled sample data.
  const reload = async () => {
    const rows = await fetchOpportunities();
    if (rows && rows.length) { setRemoteOpps(rows); setSource('db'); } else setSource('local');
  };
  const [notices, setNotices] = useState<Notice[]>([]);
  const reloadNotices = async () => { const n = await fetchNotices(); if (n) setNotices(n); };
  useEffect(() => { void reload(); void reloadNotices(); }, []);

  // Track sign-in; pull the user's profile and saved items from the database.
  useEffect(() => {
    if (!supabase) return;
    const onSession = async (email: string | null) => {
      setUser(email);
      if (!email) { setIsAdmin(false); return; }
      const [admin, data] = await Promise.all([checkIsAdmin(), loadUserData()]);
      setIsAdmin(admin);
      if (data.profile) setProfileLocal(data.profile);
      else void saveProfileRemote(profile); // first sign-in: keep what they filled in as a guest
      setSaved((s) => [...new Set([...s, ...data.saved])]);
      if (admin) { void reload(); void reloadNotices(); } // admins can see drafts and dismissed notices too
    };
    supabase.auth.getSession().then(({ data }) => onSession(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { void onSession(session?.user.email ?? null); });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allOpps = source === 'db' && remoteOpps ? remoteOpps : localOpps;
  // Visitors see only listings an admin has verified against the official notice.
  // Admins also see drafts and sample entries, so they can work on them.
  const opps = isAdmin ? allOpps : allOpps.filter((o) => o.status === 'verified' && !o.sample);
  const hiddenCount = allOpps.length - allOpps.filter((o) => o.status === 'verified' && !o.sample).length;

  const state: AppState = {
    lang, setLang, t, opps, saved, go, user, isAdmin, source,
    profile,
    setProfile: (p) => { setProfileLocal(p); if (user) void saveProfileRemote(p); },
    setOpps: (f) => (source === 'db' ? setRemoteOpps((o) => f(o ?? [])) : setLocalOpps(f)),
    toggleSaved: (id) => {
      const on = !saved.includes(id);
      setSaved((s) => (on ? [...s, id] : s.filter((x) => x !== id)));
      if (user && source === 'db') void setSavedRemote(id, on);
    },
    saveOpp: async (o) => {
      if (source === 'db' && isAdmin) {
        const r = await saveOpportunity(o);
        if (!r.ok) return r.error;
        setRemoteOpps((list) => upsert(list ?? [], r.opp));
        return null;
      }
      setLocalOpps((list) => upsert(list, o));
      return null;
    },
    deleteOpp: async (id) => {
      if (source === 'db' && isAdmin) {
        const err = await deleteOpportunity(id);
        if (err) return err;
        setRemoteOpps((list) => (list ?? []).filter((x) => x.id !== id));
        return null;
      }
      setLocalOpps((list) => list.filter((x) => x.id !== id));
      return null;
    },
    signIn: async (email) => {
      if (!supabase) return 'Sign-in is not available right now.';
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + (window.location.protocol === 'file:' ? window.location.pathname : '/') } });
      return error ? error.message : null;
    },
    signOut: async () => { await supabase?.auth.signOut(); },
    notices,
    setNoticeStatus: async (id, status, listingId) => {
      const err = await setNoticeStatusRemote(id, status, listingId);
      if (!err) setNotices((list) => list.map((n) => (n.id === id ? { ...n, status, listing_id: listingId ?? null } : n)));
      return err;
    },
  };

  return (
    <Ctx.Provider value={state}>
      <div className="shell" lang={lang}>
        <header className="top">
          <div className="top-in">
            <a className="brand" href={hrefFor('home')}><Logo />{t('appName')}</a>
            <nav className="nav-desktop" aria-label="Main">
              {NAV.map(([r, k]) => <a key={r} href={hrefFor(r)} className={section(route) === section(r) ? 'on' : ''}>{t(k)}</a>)}
            </nav>
            <div className="top-tools">
              {isAdmin && <a href={hrefFor('admin')} className={'admin-link desk-only ' + (route === 'admin' ? 'on' : '')}>{t('navAdmin')}</a>}
              <a href={hrefFor('profile')} className={'admin-link ' + (route === 'profile' ? 'on' : '')}>{user ? t('navProfile') : t('signIn')}</a>
              <button type="button" className="theme-btn" onClick={toggleTheme}
                aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')} title={theme === 'dark' ? t('lightMode') : t('darkMode')}>
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
              </button>
              <select id="lang" aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
                {(Object.keys(LANG_NAMES) as Lang[]).map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
              </select>
            </div>
          </div>
        </header>
        {isAdmin && hiddenCount > 0 && <div className="banner" role="note"><div className="banner-in">{t('adminPreview').replace('{n}', String(hiddenCount))}</div></div>}
        <main>{page(route)}</main>
        <footer className="foot">
          <nav className="foot-links"><a href={hrefFor('about')}>About</a><a href={hrefFor('privacy')}>Privacy policy</a><a href={hrefFor('terms')}>Terms of use</a><a href={'mailto:' + SITE.contactEmail}>Contact</a></nav>
          <p>{t('noGuarantee')}</p>
          <p className="small">© {new Date().getFullYear()} MargDisha</p>
        </footer>
        <nav className="tabbar" aria-label="Main">
          {NAV.filter((n) => n[3]).map(([r, k, icon]) => (
            <a key={r} href={hrefFor(r)} className={section(route) === section(r) ? 'on' : ''}>
              <Icon name={icon} size={22} /><span>{t(k)}</span>
            </a>
          ))}
        </nav>
      </div>
    </Ctx.Provider>
  );
}
