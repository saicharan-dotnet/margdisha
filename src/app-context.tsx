import { createContext, useContext } from 'react';
import type { Opportunity, Profile } from './data/types';
import { STRINGS, type Key, type Lang } from './i18n/strings';

export interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
  profile: Profile;
  setProfile: (p: Profile) => void;
  opps: Opportunity[];
  setOpps: (f: (o: Opportunity[]) => Opportunity[]) => void;
  saved: string[];
  toggleSaved: (id: string) => void;
  go: (route: string) => void;
  /** Signed-in user's email, or null. */
  user: string | null;
  isAdmin: boolean;
  /** Where opportunities came from: the live database, or bundled sample data. */
  source: 'db' | 'local' | 'loading';
  /** Saves one opportunity: to the database when signed in as admin, otherwise only in this browser. */
  saveOpp: (o: Opportunity) => Promise<string | null>;
  signIn: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const Ctx = createContext<AppState>(null as unknown as AppState);
export const useApp = () => useContext(Ctx);
export const translator = (lang: Lang) => (k: Key) => STRINGS[lang][k] ?? STRINGS.en[k];
