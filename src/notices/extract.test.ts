import { describe, expect, it } from 'vitest';
import { areaFor } from './collect';
import { extractLinks, headingNotices, cenMenuNotices, isOfficialLink, noticesFromJson, pickNotices, resolve } from './extract';

const PAGE = `
<html><head><script>var a = '<a href="/x">recruitment exam fake</a>';</script></head><body>
<ul class="menu"><li><a href="/">Home</a></li><li><a href="/contact">Contact us</a></li><li><a href="/notices">Notifications</a></li></ul>
<table>
  <tr><td>Combined Graduate Level Examination 2027 &ndash; Notice</td><td><a href="docs/cgl.pdf">Click here (1.2 MB)</a></td></tr>
  <tr><td><a href="https://example.gov.in/je.pdf" target="_blank">Junior Engineer recruitment: corrigendum</a></td></tr>
  <tr><td><a href='javascript:void(0)'>Admit card for the selection post exam</a></td></tr>
  <tr><td><a href="/tender/1">Tender notice for printing of exam papers</a></td></tr>
</table>
<p><a href="/cgl.pdf#page=2">Combined Graduate Level Examination 2027 &ndash; Notice</a></p>
<li><a href="/admissions/jnvst-6.pdf">JNVST 2027 admission for Class VI</a></li>
</body></html>`;

describe('notice extraction', () => {
  const links = extractLinks(PAGE, 'https://ssc.example.gov.in/home/');
  const picked = pickNotices(links, { keywords: ['jnvst'] });

  it('takes the title from the table row when the link says "Click here"', () => {
    expect(picked[0]).toEqual({ title: 'Combined Graduate Level Examination 2027 – Notice', url: 'https://ssc.example.gov.in/home/docs/cgl.pdf' });
  });
  it('keeps real notices and drops menus, scripts, tenders and javascript links', () => {
    expect(picked.map((p) => p.title)).toEqual([
      'Combined Graduate Level Examination 2027 – Notice',
      'Junior Engineer recruitment: corrigendum',
      'Combined Graduate Level Examination 2027 – Notice',
      'JNVST 2027 admission for Class VI',
    ]);
  });
  it('keeps only official links', () => {
    expect(isOfficialLink('https://exams.nta.nic.in/niftee/', 'https://kvsangathan.nic.in/')).toBe(true);
    expect(isOfficialLink('https://www.ibps.in/crp.pdf', 'https://ibps.in/')).toBe(true);
    expect(isOfficialLink('https://ndtv.in/education/x', 'https://kvsangathan.nic.in/')).toBe(false);
  });
  it('resolves relative links and strips fragments', () => {
    expect(resolve('/cgl.pdf#page=2', 'https://a.gov.in/x/')).toBe('https://a.gov.in/cgl.pdf');
    expect(resolve('mailto:x@y.in', 'https://a.gov.in/')).toBeNull();
  });

  it('reads notices from a JSON feed', () => {
    const body = { data: { items: [
      { title_english: 'Notice dated 14.09.2026 – Tier-II result', media_type_name: 'Recruitment', external_url: null, download_url: '/api/public/media/305/download' },
      { title_english: '', download_url: '/x' },
    ] } };
    expect(noticesFromJson(body, { url: 'https://navodaya.gov.in/api/public/media?page=1', items: 'data.items', title: 'title_english', link: ['external_url', 'download_url'], prefix: 'media_type_name' }))
      .toEqual([{ title: 'Recruitment: Notice dated 14.09.2026 – Tier-II result', url: 'https://navodaya.gov.in/api/public/media/305/download' }]);
    expect(noticesFromJson({ data: [{ DESCRIPTION: 'CET2026', NOTIFICATION_ID: 13190, DEPT_SHORT_NAME: 'TGCET' }] },
      { url: 'https://tgcet.cgg.gov.in/TGCETWEB/getNotifications', items: 'data', title: 'DESCRIPTION', prefix: 'DEPT_SHORT_NAME', linkTemplate: 'https://tgcet.cgg.gov.in/TGCETWEB/?notification={NOTIFICATION_ID}' }))
      .toEqual([{ title: 'TGCET: CET2026', url: 'https://tgcet.cgg.gov.in/TGCETWEB/?notification=13190' }]);
    const ssc = { url: 'https://ssc.gov.in/api/general-website/portal/records?page=1', items: 'data', title: 'headline', link: ['redirectUrl'], linkTemplate: 'https://ssc.gov.in/api/attachment/{attachments.0.path}' };
    expect(noticesFromJson({ data: [
      { headline: 'Notice of CGL 2026', redirectUrl: '', attachments: [{ path: 'uploads\\masterData\\NoticeBoards\\cgl notice.pdf' }] },
      { headline: 'No file yet', redirectUrl: '', attachments: [] },
    ] }, ssc)).toEqual([{ title: 'Notice of CGL 2026', url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/cgl%20notice.pdf' }]);
  });

  it('files staff recruitment from school sites under jobs', () => {
    expect(areaFor({ area: 'school' }, 'Recruitment: result for the posts of PGT (Hindi)')).toBe('job');
    expect(areaFor({ area: 'school' }, 'JNVST 2027 admission for Class VI')).toBe('school');
  });
});

describe('linkMust', () => {
  it('keeps only links whose address has one of the given parts', () => {
    const links = [
      { title: 'Recruitment of Graduate Trainees 2026', url: 'https://x.in/documents/77/advt.pdf' },
      { title: 'CSR Application Process for NGOs', url: 'https://x.in/web/csr/apply' },
    ];
    expect(pickNotices(links, { linkMust: ['/documents/'] }).map((l) => l.url)).toEqual(['https://x.in/documents/77/advt.pdf']);
  });
});


describe('headingNotices', () => {
  it('gives each heading the same address on every visit', () => {
    const page = '<li><h5>Recruitment of Engineers, Advt.18/26 &amp; more</h5><a href="x.php?token=abc">Adv</a></li><li><h5>Interview schedule for Advt.13/26</h5></li>';
    const a = headingNotices(page, 'https://careers.example.in/recruitment/', 'h5');
    const b = headingNotices(page.replace('abc', 'xyz'), 'https://careers.example.in/recruitment/', 'h5');
    expect(a).toEqual(b);
    expect(a[0].title).toBe('Recruitment of Engineers, Advt.18/26 & more');
    expect(a[0].url).toMatch(/^https:\/\/careers\.example\.in\/recruitment\/#n[0-9a-z]+$/);
    expect(a[1].url).not.toBe(a[0].url);
  });
});

describe('cenMenuNotices', () => {
  it('turns the RRB CEN menu into one notice per CEN and notice type', () => {
    const base = 'https://rrb.indianrailways.gov.in/getdata?loc=secunderabad&';
    const links = [
      { title: 'Notification', url: base.replace('loc', 'cennum=08/2026&loc') + 'category=Notification' },
      { title: 'Notification', url: base.replace('loc', 'cennum=08/2026&loc') + 'category=Notification' },
      { title: 'E-Call Letters', url: base.replace('loc', 'cennum=03/2026&loc') + 'category=E-Call%20Letters' },
      { title: 'Mock Test Link', url: base.replace('loc', 'cennum=03/2026&loc') + 'category=Mock%20Test%20Link' },
      { title: 'Notification', url: base.replace('loc', 'cennum=06/2025&loc') + 'category=Notification' },
      { title: 'Home', url: 'https://rrb.indianrailways.gov.in/' },
    ];
    expect(cenMenuNotices(links, 2026, { '08/2026': 'Station Master' }).map((n) => n.title)).toEqual([
      'RRB CEN 08/2026 (Station Master): Notification', 'RRB CEN 03/2026: E-Call Letters']);
  });
});
