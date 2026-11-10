import { SITE } from '../site-config';
import { hrefFor } from '../store';

const Contact = () => SITE.contactEmail
  ? <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
  : <span>the contact address on our <a href={hrefFor('about')}>About page</a></span>;

function InfoPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="page info-page">
      <div className="page-head"><h1>{title}</h1><p className="small muted">Last updated {SITE.updated}</p></div>
      <div className="prose">{children}</div>
      <nav className="info-links"><a href={hrefFor('about')}>About</a> · <a href={hrefFor('privacy')}>Privacy policy</a> · <a href={hrefFor('terms')}>Terms of use</a></nav>
    </section>
  );
}

export function About() {
  return (
    <InfoPage title="About MargDisha">
      <p>MargDisha helps students and parents in India find their next step: what to study after Class 10, Intermediate, a diploma or a degree; which government and private jobs they can apply for; which scholarships and entrance exams fit them; and when school admissions such as Kendriya Vidyalaya, Navodaya, Sainik, Military and Gurukul schools usually open.</p>
      <h2>Where our information comes from</h2>
      <p>Every listing links to the official notification or website. A small program reads official government websites every few hours and shows new notices under "Latest from official websites". We publish a full listing only after checking it against the official notification. The calendars show when forms usually open, based on past years; dates change every year, so always confirm on the official website before applying.</p>
      <h2>What MargDisha is not</h2>
      <p>We are not a government body and are not linked to any recruiting agency, school or exam board. We never ask for money to apply for a job or admission. Applications are made only on the official websites.</p>
      <h2>Free to use</h2>
      <p>MargDisha is free. We may show advertisements to cover running costs. Ads are marked as ads and are never part of a listing.</p>
      <h2>Contact</h2>
      <p>{SITE.contactEmail ? <>Write to us at <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> to report a mistake, a broken link or anything else.</> : 'A contact email address will be listed here shortly.'}</p>
    </InfoPage>
  );
}

export function Privacy() {
  return (
    <InfoPage title="Privacy policy">
      <p>This policy explains what information {SITE.name} ({SITE.url}) collects and how it is used.</p>
      <h2>Information you give us</h2>
      <ul>
        <li><b>Without signing in</b>, the profile you fill in (qualification, state, category, interests) and your saved items stay in your own browser's storage. They are not sent to us.</li>
        <li><b>If you sign in</b> with your email address, we store your email, your profile and your saved items in our database (hosted by Supabase) so you can use them on other devices. We use your email only to sign you in.</li>
      </ul>
      <p>We do not sell your personal information and do not share it with anyone except the service providers listed below, who process it on our behalf.</p>
      <h2>Advertising and cookies</h2>
      <p>We use Google AdSense to show ads. Google and its partners use cookies to show ads based on your previous visits to this and other websites. Google's use of advertising cookies lets it and its partners show ads to you based on your visits to our site and/or other sites on the internet.</p>
      <p>You can turn off personalised advertising in <a href="https://adssettings.google.com" target="_blank" rel="noreferrer">Google Ads Settings</a>, or turn off many third-party vendors' cookies at <a href="https://www.aboutads.info/choices/" target="_blank" rel="noreferrer">aboutads.info</a>. Read <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">how Google uses information from sites that use its services</a>.</p>
      <h2>Service providers</h2>
      <ul>
        <li>Cloudflare hosts the website and may keep short-term technical logs (such as IP address and browser type) for security.</li>
        <li>Supabase stores listings, notices and, if you sign in, your account data.</li>
        <li>Google provides advertising (AdSense) and fonts.</li>
      </ul>
      <h2>Children</h2>
      <p>Parents use {SITE.name} to look up school admissions. We do not knowingly collect personal information from children under 18; a parent or guardian should sign in on their behalf.</p>
      <h2>Your choices</h2>
      <p>You can clear your browser storage at any time to remove a profile kept on your device. If you signed in and want your account and data deleted, contact us at <Contact /> and we will delete it.</p>
      <h2>Changes</h2>
      <p>If this policy changes, we will update this page and the date at the top.</p>
    </InfoPage>
  );
}

export function Terms() {
  return (
    <InfoPage title="Terms of use">
      <p>By using {SITE.name} you agree to these terms.</p>
      <h2>Guidance only</h2>
      <p>The information on {SITE.name} is for guidance. It does not guarantee selection, admission, a job or a scholarship award. Eligibility results are an estimate from the details you enter. Dates, fees, vacancies and rules are set by the official bodies and can change; always read the official notification and apply only on the official website.</p>
      <h2>Accuracy</h2>
      <p>We try to keep information correct and link to the official source for every listing, but we cannot promise it is complete, current or free of mistakes. If you find an error, tell us at <Contact />.</p>
      <h2>Links and advertisements</h2>
      <p>We link to official and third-party websites and show advertisements. We are not responsible for the content of other websites or for products and services in ads.</p>
      <h2>Fair use</h2>
      <p>Do not misuse the site, try to break its security, or copy its content in bulk.</p>
      <h2>Contact</h2>
      <p>Questions about these terms: <Contact />.</p>
    </InfoPage>
  );
}
