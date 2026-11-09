import { describe, expect, it } from 'vitest';
import { extractLinks, isOfficialLink, pickNotices, resolve } from './extract';

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
});
