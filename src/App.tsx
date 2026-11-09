import { useMemo } from 'react';
import { Ctx, translator, type AppState } from './app-context';
import type { Opportunity, Profile as P } from './data/types';
import { SEED_OPPORTUNITIES } from './data/seed';
import { LANG_NAMES, type Lang } from './i18n/strings';
import { usePersisted, useHashRoute } from './store';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Profile } from './pages/Profile';
import { Matches } from './pages/Matches';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';

const PAGES = { home: Home, explore: Explore, profile: Profile, matches: Matches, dashboard: Dashboard, admin: Admin } as const;
type Route = keyof typeof PAGES;
const NAV: [Route, 'navHome' | 'navExplore' | 'navProfile' | 'navMatches' | 'navDashboard' | 'navAdmin'][] = [
  ['home', 'navHome'], ['explore', 'navExplore'], ['profile', 'navProfile'], ['matches', 'navMatches'], ['dashboard', 'navDashboard'], ['admin', 'navAdmin'],
];

export function App() {
  const [route, go] = useHashRoute();
  const [lang, setLang] = usePersisted<Lang>('lang', 'en');
  const [profile, setProfile] = usePersisted<P>('profile', { skills: [], interests: [] });
  const [opps, setOpps] = usePersisted<Opportunity[]>('opps-v1', SEED_OPPORTUNITIES);
  const [saved, setSaved] = usePersisted<string[]>('saved', []);
  const t = useMemo(() => translator(lang), [lang]);

  const state: AppState = {
    lang, setLang, t, profile, setProfile, opps, setOpps: (f) => setOpps(f), saved, go,
    toggleSaved: (id) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
  };
  const Page = PAGES[(route in PAGES ? route : 'home') as Route];

  return (
    <Ctx.Provider value={state}>
      <div lang={lang}>
        <header className="top">
          <a className="brand" href="#/home">◆ {t('appName')}</a>
          <nav aria-label="Main">
            {NAV.map(([r, k]) => <a key={r} href={'#/' + r} className={route === r ? 'on' : ''}>{t(k)}</a>)}
          </nav>
          <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            {(Object.keys(LANG_NAMES) as Lang[]).map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
          </select>
        </header>
        <div className="banner" role="note">⚠ {t('sampleBanner')}</div>
        <main><Page /></main>
        <footer className="foot small muted">{t('noGuarantee')}</footer>
      </div>
    </Ctx.Provider>
  );
}
