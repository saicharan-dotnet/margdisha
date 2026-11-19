import { useApp } from '../app-context';
import { daysLeft } from '../engine/match';
import { liveAlerts } from '../data/hot-alerts';

/** "Hot job alert" cards for short-lived openings; each disappears after its expiry date. */
export function HotAlerts() {
  const { t } = useApp();
  const alerts = liveAlerts();
  if (!alerts.length) return null;
  return (
    <div className="hot-alerts">
      {alerts.map((a) => {
        const d = daysLeft(a.expires);
        const nice = new Date(a.expires + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        return (
          <article key={a.id} className="hot-alert">
            <div className="hot-top">
              <span className="hot-badge">🔥 {t('hotAlert')}</span>
              <span className="hot-days">{t('alertUntil')} {nice} · {d} {t('daysLeft')}</span>
            </div>
            <h3>{a.company} · {a.location}</h3>
            <div className="hot-roles">
              {a.roles.map((r) => (
                <div key={r.title} className="hot-role">
                  <b>{r.title}</b>
                  {r.points.length > 0 && <ul>{r.points.map((p) => <li key={p}>{p}</li>)}</ul>}
                </div>
              ))}
            </div>
            <p className="hot-apply">
              <b>{t('applyByEmail')}:</b> <a href={`mailto:${a.email}?subject=${encodeURIComponent('Application' + (a.referral ? ' – Referral ID ' + a.referral : ''))}`}>{a.email}</a>
              {a.referral && <><br /><b>{t('referralId')}:</b> <code>{a.referral}</code> <span className="muted">({t('mentionRole')})</span></>}
            </p>
            <p className="small muted">{t('notRecruiter')}</p>
          </article>
        );
      })}
    </div>
  );
}
