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
}

export const Ctx = createContext<AppState>(null as unknown as AppState);
export const useApp = () => useContext(Ctx);
export const translator = (lang: Lang) => (k: Key) => STRINGS[lang][k] ?? STRINGS.en[k];
