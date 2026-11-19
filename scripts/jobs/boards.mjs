// Official company job boards read by collect-jobs.mjs. Only public board APIs (Greenhouse, Lever, Ashby).
// To add a company, find its careers page link (boards.greenhouse.io/<slug>, jobs.lever.co/<slug> or jobs.ashbyhq.com/<slug>).
const gh = (slug, name) => ({ ats: 'greenhouse', slug, name });
const lv = (slug, name) => ({ ats: 'lever', slug, name });
const ab = (slug, name) => ({ ats: 'ashby', slug, name });
// Boards checked on 19 Nov 2026; ones that no longer exist were removed.

export const BOARDS = [
  gh('groww', 'Groww'), gh('druva', 'Druva'),
  gh('rubrik', 'Rubrik'), gh('databricks', 'Databricks'), gh('stripe', 'Stripe'), gh('coinbase', 'Coinbase'), gh('cloudflare', 'Cloudflare'),
  gh('mongodb', 'MongoDB'), gh('okta', 'Okta'), gh('gitlab', 'GitLab'), gh('elastic', 'Elastic'), gh('twilio', 'Twilio'), gh('purestorage', 'Pure Storage'), gh('samsara', 'Samsara'), gh('zscaler', 'Zscaler'), gh('toast', 'Toast'), gh('hackerrank', 'HackerRank'),
  gh('highradius', 'HighRadius'), gh('inmobi', 'InMobi'),
  gh('datadog', 'Datadog'), gh('razorpaysoftwareprivatelimited', 'Razorpay'), gh('observeai', 'Observe.AI'), gh('airbnb', 'Airbnb'), gh('pinterest', 'Pinterest'), gh('dropbox', 'Dropbox'), gh('udemy', 'Udemy'), gh('slice', 'slice'),
  gh('appsflyer', 'AppsFlyer'), lv('cred', 'CRED'), lv('meesho', 'Meesho'), lv('porter', 'Porter'), lv('paytm', 'Paytm'), lv('fi', 'Fi Money'), lv('pocketfm', 'Pocket FM'),
  ab('atlan', 'Atlan'), ab('sarvam', 'Sarvam AI'), ab('ramp', 'Ramp'), ab('deel', 'Deel'), ];
