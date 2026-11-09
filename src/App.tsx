import { useEffect, useMemo, useState } from 'react';
import { Ctx, translator, type AppState } from './app-context';
import type { Opportunity, OpportunityKind, Profile as P } from './data/types';
import { SEED_OPPORTUNITIES } from './data/seed';
import { checkIsAdmin, deleteOpportunity, fetchNotices, fetchOpportunities, setNoticeStatus as setNoticeStatusRemote, type Notice, loadUserData, saveOpportunity, saveProfileRemote, setSavedRemote } from './data/remote';
import { supabase } from './lib/supabase';
import { LANG_NAMES, type Key, type Lang } from './i18n/strings';
import { usePersisted, useHashRoute } from './store';
import { Icon, type IconName } from './components/Icon';
import { Logo } from './components/Logo';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Profile } from './pages/Profile';
import { Matches } from './pages/Matches';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { Jobs } from './pages/Jobs';

const NAV: [string, Key, IconName][] = [
  ['home', 'navHome', 'home'], ['explore', 'navExplore', 'compass'], ['jobs-govt', 'navJobs', 'briefcase'],
  ['matches', 'navMatches', 'check'], ['dashboard', 'navDashboard', 'user'],
];

function page(route: string) {
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
    default: return <Home />;
  }
}
const section = (r: string) => r.split('-')[0];
const upsert = (list: Opportunity[], o: Opportunity) => (list.some((x) => x.id === o.id) ? list.map((x) => (x.id === o.id ? o : x)) : [o, ...list]);

export function App() {
  const [route, go] = useHashRoute();
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

  const opps = source === 'db' && remoteOpps ? remoteOpps : localOpps;

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
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + window.location.pathname } });
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
            <a className="brand" href="#home"><Logo />{t('appName')}</a>
            <nav className="nav-desktop" aria-label="Main">
              {NAV.map(([r, k]) => <a key={r} href={'#' + r} className={section(route) === section(r) ? 'on' : ''}>{t(k)}</a>)}
            </nav>
            <div className="top-tools">
              {isAdmin && <a href="#admin" className={'admin-link desk-only ' + (route === 'admin' ? 'on' : '')}>{t('navAdmin')}</a>}
              <a href="#profile" className={'admin-link ' + (route === 'profile' ? 'on' : '')}>{user ? t('navProfile') : t('signIn')}</a>
              <select id="lang" aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
                {(Object.keys(LANG_NAMES) as Lang[]).map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
              </select>
            </div>
          </div>
        </header>
        {opps.some((o) => o.sample) && <div className="banner" role="note"><div className="banner-in">{t('sampleBanner')}</div></div>}
        <main>{page(route)}</main>
        <footer className="foot">{t('noGuarantee')}</footer>
        <nav className="tabbar" aria-label="Main">
          {NAV.map(([r, k, icon]) => (
            <a key={r} href={'#' + r} className={section(route) === section(r) ? 'on' : ''}>
              <Icon name={icon} size={22} /><span>{t(k)}</span>
            </a>
          ))}
        </nav>
      </div>
    </Ctx.Provider>
  );
}
