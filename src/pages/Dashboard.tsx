import { useMemo } from 'react';
import { useApp } from '../app-context';
import { daysLeft, LEVEL_LABEL, matchAll } from '../engine/match';
import { DeadlineTag, VerificationBadge } from '../components/OppCard';

export function Dashboard() {
  const { t, profile, opps, saved, go } = useApp();
  const matched = useMemo(() => matchAll(profile, opps, { includeUnverified: true }), [profile, opps]);
  const counts = { likely: 0, verify: 0, not: 0 };
  matched.forEach((m) => { if (!m.result.expired) counts[m.result.status]++; });
  const upcoming = matched
    .filter((m) => m.opp.deadline && !m.result.expired && m.result.status !== 'not')
    .sort((a, b) => a.opp.deadline!.localeCompare(b.opp.deadline!)).slice(0, 5);
  const savedItems = matched.filter((m) => saved.includes(m.opp.id));
  const missing = [...new Set(matched.flatMap((m) => m.result.missing))];

  const next = !profile.level ? 'Tell us your qualification so we can start matching.'
    : missing.length ? `Add ${missing.slice(0, 3).join(', ')} to your profile to turn "${t('verify')}" results into clear answers.`
    : upcoming[0] ? `The nearest deadline is "${upcoming[0].opp.title}" in ${daysLeft(upcoming[0].opp.deadline!)} days. Open the official link and check the notification.`
    : 'Explore study options and save the ones you like.';

  return (
    <section className="page">
      <h1>{t('navDashboard')}{profile.name ? ` · ${profile.name}` : ''}</h1>
      <div className="card highlight"><h2 className="h-sm">{t('nextStep')}</h2><p>{next}</p></div>
      <div className="stats">
        <button className="stat ok" onClick={() => go('matches')}><b>{counts.likely}</b>{t('likely')}</button>
        <button className="stat warn" onClick={() => go('matches')}><b>{counts.verify}</b>{t('verify')}</button>
        <button className="stat bad" onClick={() => go('matches')}><b>{counts.not}</b>{t('not')}</button>
      </div>
      <div className="two">
        <div className="card">
          <h2 className="h-sm">{t('navProfile')}</h2>
          {profile.level ? (
            <ul className="plain">
              <li>{LEVEL_LABEL[profile.level]} {profile.levelStatus === 'pursuing' ? `(${t('fPursuing')})` : ''} {profile.stream ?? ''}</li>
              {profile.percentage !== undefined && <li>{profile.percentage}%</li>}
              {profile.state && <li>{profile.state}</li>}
              {profile.skills.length > 0 && <li>{profile.skills.join(', ')}</li>}
            </ul>
          ) : <p className="muted">—</p>}
          <button className="link" onClick={() => go('profile')}>Edit →</button>
        </div>
        <div className="card">
          <h2 className="h-sm">{t('upcoming')}</h2>
          <ul className="plain">
            {upcoming.map((m) => <li key={m.opp.id}>{m.opp.title}<br /><DeadlineTag deadline={m.opp.deadline} /> <VerificationBadge opp={m.opp} /></li>)}
            {!upcoming.length && <li className="muted">—</li>}
          </ul>
        </div>
        <div className="card">
          <h2 className="h-sm">{t('savedItems')}</h2>
          <ul className="plain">
            {savedItems.map((m) => <li key={m.opp.id}>{m.opp.title} <DeadlineTag deadline={m.opp.deadline} /></li>)}
            {!savedItems.length && <li className="muted">—</li>}
          </ul>
        </div>
      </div>
      <p className="small muted">Coming in later phases: notifications and reminders, career roadmap and learning progress, account sign-in.</p>
    </section>
  );
}
