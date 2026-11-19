// Official company job boards read by collect-jobs.mjs. Only public board APIs (Greenhouse, Lever, Ashby).
// To add a company, find its careers page link (boards.greenhouse.io/<slug>, jobs.lever.co/<slug> or jobs.ashbyhq.com/<slug>).
const gh = (slug, name) => ({ ats: 'greenhouse', slug, name });
const lv = (slug, name) => ({ ats: 'lever', slug, name });
const ab = (slug, name) => ({ ats: 'ashby', slug, name });
// Boards checked on 19 Nov 2026; ones that no longer exist were removed.

export const BOARDS = [
  gh('groww', 'Groww'), gh('druva', 'Druva'),
  gh('rubrik', 'Rubrik'), gh('databricks', 'Databricks'), gh('stripe', 'Stripe'), gh('coinbase', 'Coinbase'), gh('mongodb', 'MongoDB'), gh('okta', 'Okta'), gh('gitlab', 'GitLab'), gh('elastic', 'Elastic'), gh('twilio', 'Twilio'), gh('purestorage', 'Pure Storage'), gh('samsara', 'Samsara'), gh('zscaler', 'Zscaler'), gh('toast', 'Toast'), gh('hackerrank', 'HackerRank'),
  gh('highradius', 'HighRadius'), gh('inmobi', 'InMobi'),
  gh('datadog', 'Datadog'), gh('razorpaysoftwareprivatelimited', 'Razorpay'), gh('observeai', 'Observe.AI'), gh('airbnb', 'Airbnb'), gh('appsflyer', 'AppsFlyer'), lv('cred', 'CRED'), lv('meesho', 'Meesho'), lv('paytm', 'Paytm'), lv('pocketfm', 'Pocket FM'),
  gh('agoda', 'Agoda'), gh('thoughtspot', 'ThoughtSpot'), gh('harnessinc', 'Harness'), gh('fivetran', 'Fivetran'), gh('addepar', 'Addepar'),
  gh('zeotap', 'Zeotap'), gh('wise', 'Wise'), gh('chargepoint', 'ChargePoint'), gh('gojek', 'Gojek'), gh('grab', 'Grab'), gh('blinkit', 'Blinkit'),
  gh('juspay', 'Juspay'), gh('smartsheet', 'Smartsheet'), gh('newrelic', 'New Relic'), gh('hubspot', 'HubSpot'), gh('zendesk', 'Zendesk'),
  gh('freshworks', 'Freshworks'), gh('urbancompany', 'Urban Company'), gh('nobroker', 'NoBroker'), gh('acko', 'ACKO'), gh('khatabook', 'Khatabook'),
  gh('jupiter', 'Jupiter'), gh('bharatpe', 'BharatPe'), gh('cars24', 'CARS24'),
  lv('tekion', 'Tekion'), lv('zeta', 'Zeta'), lv('sharechat', 'ShareChat'), lv('mindtickle', 'Mindtickle'), lv('chargebee', 'Chargebee'),
  lv('innovaccer', 'Innovaccer'), lv('zomato', 'Zomato'), lv('phonepe', 'PhonePe'), lv('browserstack', 'BrowserStack'), lv('clevertap', 'CleverTap'),
  lv('dream11', 'Dream11'), lv('unacademy', 'Unacademy'), lv('icertis', 'Icertis'), lv('hasura', 'Hasura'), lv('moengage', 'MoEngage'),
  ab('atlan', 'Atlan'), ab('sarvam', 'Sarvam AI'), ab('juspay', 'Juspay'), ab('zepto-technologies', 'Zepto'), ab('phonepe', 'PhonePe'), ab('razorpay', 'Razorpay'),
];
