import { useState } from 'react';
import { useApp } from '../app-context';
import type { Notice } from '../data/remote';
import { Icon } from './Icon';

export function ago(iso: string, t: ReturnType<typeof useApp>['t'], now = Date.now()) {
  const h = Math.floor((now - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return t('today');
  if (h < 24) return `${h} ${t('hoursAgo')}`;
  return `${Math.floor(h / 24)} ${t('daysAgo')}`;
}

/** Notices collected automatically from official websites. Always labelled as not checked. */
export function NoticeFeed({ areas, limit = 8, title = true, more }: {
  areas?: Notice['area'][]; limit?: number; title?: boolean; more?: () => void;
}) {
  const { t, notices } = useApp();
  const [n, setN] = useState(limit);
  const list = notices.filter((x) => x.status !== 'ignored' && (!areas || areas.includes(x.area)));
  return (
    <section className="feed" aria-labelledby="feed-h">
      {title && (
        <div className="feed-head">
          <h2 id="feed-h" className="section-h"><span className="live-dot" aria-hidden /> {t('latestTitle')}</h2>
          {more && list.length > 0 && <button className="link" onClick={more}>{t('seeAll')} →</button>}
        </div>
      )}
      <p className="small muted feed-note">{t('latestNote')}</p>
      {list.length === 0 ? <p className="feed-empty">{t('noUpdates')}</p> : (
        <ul className="feed-list">
          {list.slice(0, n).map((x) => {
            const fresh = Date.now() - new Date(x.first_seen).getTime() < 48 * 3_600_000;
            return (
              <li key={x.id}>
                <a href={x.url} target="_blank" rel="noreferrer">
                  <span className={'feed-src a-' + x.area}>{x.sector ?? x.source_name}</span>
                  <span className="feed-title">{x.title}</span>
                  <span className="feed-meta">
                    {fresh && <span className="new-badge">{t('newBadge')}</span>}
                    {x.source_name} · {ago(x.first_seen, t)} <Icon name="arrow" size={14} />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
      {list.length > n && <button className="btn ghost sm" onClick={() => setN(n + 20)}>{t('showMore')}</button>}
    </section>
  );
}
