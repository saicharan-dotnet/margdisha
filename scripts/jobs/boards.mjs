// Official company job boards read by collect-jobs.mjs. Only public board APIs (Greenhouse, Lever, Ashby),
// which companies publish so other sites can list their jobs.
// To add a company, find its careers page link (job-boards.greenhouse.io/<slug>, jobs.lever.co/<slug>
// or jobs.ashbyhq.com/<slug>), add it here and run the "Collect private jobs" workflow with "discover" ticked.
// Every board below was checked on 19 Nov 2026 and had jobs in India.
const gh = (slug, name) => ({ ats: 'greenhouse', slug, name });
const lv = (slug, name) => ({ ats: 'lever', slug, name });
const ab = (slug, name) => ({ ats: 'ashby', slug, name });

export const BOARDS = [
  gh('agoda', 'Agoda'), gh('airbnb', 'Airbnb'), gh('appsflyer', 'AppsFlyer'), gh('chargepoint', 'ChargePoint'), gh('databricks', 'Databricks'),
  gh('datadog', 'Datadog'), gh('druva', 'Druva'), gh('elastic', 'Elastic'), gh('fivetran', 'Fivetran'), gh('gitlab', 'GitLab'), gh('groww', 'Groww'),
  gh('hackerrank', 'HackerRank'), gh('harnessinc', 'Harness'), gh('highradius', 'HighRadius'), gh('inmobi', 'InMobi'), gh('mongodb', 'MongoDB'),
  gh('newrelic', 'New Relic'), gh('observeai', 'Observe.AI'), gh('okta', 'Okta'), gh('purestorage', 'Pure Storage'),
  gh('razorpaysoftwareprivatelimited', 'Razorpay'), gh('rubrik', 'Rubrik'), gh('samsara', 'Samsara'), gh('smartsheet', 'Smartsheet'),
  gh('stripe', 'Stripe'), gh('toast', 'Toast'), gh('twilio', 'Twilio'), gh('zscaler', 'Zscaler'),
  lv('cred', 'CRED'), lv('meesho', 'Meesho'), lv('mindtickle', 'Mindtickle'), lv('paytm', 'Paytm'), lv('pocketfm', 'Pocket FM'), lv('zeta', 'Zeta'),
  ab('atlan', 'Atlan'), ab('sarvam', 'Sarvam AI'),
];
