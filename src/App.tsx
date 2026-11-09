import { useMemo } from 'react';
import { Ctx, translator, type AppState } from './app-context';
import type { Opportunity, OpportunityKind, Profile as P } from './data/types';
import { SEED_OPPORTUNITIES } from './data/seed';
import { LANG_NAMES, type Key, type Lang } from './i18n/strings';
import { usePersisted, useHashRoute } from './store';
import { Icon, type IconName } from './components/Icon';
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

export function App() {
  const [route, go] = useHashRoute();
  const [lang, setLang] = usePersisted<Lang>('lang', 'en');
  const [profile, setProfile] = usePersisted<P>('profile', { skills: [], interests: [] });
  const [opps, setOpps] = usePersisted<Opportunity[]>('opps-v2', SEED_OPPORTUNITIES);
  const [saved, setSaved] = usePersisted<string[]>('saved', []);
  const t = useMemo(() => translator(lang), [lang]);

  const state: AppState = {
    lang, setLang, t, profile, setProfile, opps, setOpps: (f) => setOpps(f), saved, go,
    toggleSaved: (id) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
  };

  return (
    <Ctx.Provider value={state}>
      <div className="shell" lang={lang}>
        <header className="top">
          <div className="top-in">
            <a className="brand" href="#home"><span className="brand-mark" aria-hidden>N</span>{t('appName')}</a>
            <nav className="nav-desktop" aria-label="Main">
              {NAV.map(([r, k]) => <a key={r} href={'#' + r} className={section(route) === section(r) ? 'on' : ''}>{t(k)}</a>)}
            </nav>
            <div className="top-tools">
              <a href="#admin" className={'admin-link ' + (route === 'admin' ? 'on' : '')}>{t('navAdmin')}</a>
              <select id="lang" aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
                {(Object.keys(LANG_NAMES) as Lang[]).map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
              </select>
            </div>
          </div>
        </header>
        <div className="banner" role="note"><div className="banner-in">{t('sampleBanner')}</div></div>
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
