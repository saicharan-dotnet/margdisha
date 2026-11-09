import { useState } from 'react';
import { useApp } from '../app-context';

export function Account() {
  const { t, user, signIn, signOut, source } = useApp();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (source === 'local' && !user) return null; // database unreachable: guest mode only
  if (user)
    return (
      <div className="card account">
        <p>{t('signedInAs')} <b>{user}</b></p>
        <button className="btn ghost sm" onClick={() => void signOut()}>{t('signOut')}</button>
      </div>
    );
  return (
    <form className="card account" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true);
      const err = await signIn(email.trim());
      setBusy(false); setMsg(err ?? t('linkSent'));
    }}>
      <p className="muted small">{t('guestNote')}</p>
      <div className="account-row">
        <label className="sr-only" htmlFor="signin-email">{t('emailLabel')}</label>
        <input id="signin-email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn" disabled={busy}>{t('sendLink')}</button>
      </div>
      {msg && <p className="small" role="status">{msg}</p>}
    </form>
  );
}
