// Official company job boards read by collect-jobs.mjs. Only public board APIs (Greenhouse, Lever, Ashby).
// To add a company, find its careers page link (boards.greenhouse.io/<slug>, jobs.lever.co/<slug> or jobs.ashbyhq.com/<slug>).
const gh = (slug, name) => ({ ats: 'greenhouse', slug, name });
const lv = (slug, name) => ({ ats: 'lever', slug, name });
const ab = (slug, name) => ({ ats: 'ashby', slug, name });

export const BOARDS = [
  gh('postman', 'Postman'), gh('phonepe', 'PhonePe'), gh('browserstack', 'BrowserStack'), gh('groww', 'Groww'), gh('druva', 'Druva'),
  gh('rubrik', 'Rubrik'), gh('databricks', 'Databricks'), gh('stripe', 'Stripe'), gh('coinbase', 'Coinbase'), gh('cloudflare', 'Cloudflare'),
  gh('mongodb', 'MongoDB'), gh('okta', 'Okta'), gh('gitlab', 'GitLab'), gh('elastic', 'Elastic'), gh('twilio', 'Twilio'), gh('nutanix', 'Nutanix'),
  gh('purestorage', 'Pure Storage'), gh('samsara', 'Samsara'), gh('zscaler', 'Zscaler'), gh('toast', 'Toast'), gh('hackerrank', 'HackerRank'),
  gh('sprinklr', 'Sprinklr'), gh('chargebee', 'Chargebee'), gh('clevertap', 'CleverTap'), gh('mindtickle', 'Mindtickle'), gh('innovaccer', 'Innovaccer'),
  gh('highradius', 'HighRadius'), gh('icertis', 'Icertis'), gh('hasura', 'Hasura'), gh('sharechat', 'ShareChat'), gh('inmobi', 'InMobi'),
  gh('cohesity', 'Cohesity'), gh('confluent', 'Confluent'), gh('datadog', 'Datadog'), gh('razorpaysoftwareprivatelimited', 'Razorpay'), gh('razorpay', 'Razorpay'),
  gh('observeai', 'Observe.AI'), gh('unacademy', 'Unacademy'), gh('dream11', 'Dream11'), gh('swiggy', 'Swiggy'), gh('zomato', 'Zomato'), gh('meesho', 'Meesho'),
  gh('airbnb', 'Airbnb'), gh('pinterest', 'Pinterest'), gh('dropbox', 'Dropbox'), gh('udemy', 'Udemy'), gh('zeta', 'Zeta'), gh('slice', 'slice'),
  gh('mediaocean', 'Mediaocean'), gh('appsflyer', 'AppsFlyer'), gh('moengage', 'MoEngage'), gh('netomi', 'Netomi'), gh('rippling', 'Rippling'),
  lv('cred', 'CRED'), lv('meesho', 'Meesho'), lv('zepto', 'Zepto'), lv('upstox', 'Upstox'), lv('jupiter', 'Jupiter'), lv('slice', 'slice'),
  lv('khatabook', 'Khatabook'), lv('swiggy', 'Swiggy'), lv('spinny', 'Spinny'), lv('cars24', 'CARS24'), lv('urbancompany', 'Urban Company'),
  lv('practo', 'Practo'), lv('lenskart', 'Lenskart'), lv('atlan', 'Atlan'), lv('plivo', 'Plivo'), lv('leadsquared', 'LeadSquared'), lv('whatfix', 'Whatfix'),
  lv('simplilearn', 'Simplilearn'), lv('upgrad', 'upGrad'), lv('vedantu', 'Vedantu'), lv('physicswallah', 'Physics Wallah'), lv('bharatpe', 'BharatPe'),
  lv('games24x7', 'Games24x7'), lv('mpl', 'MPL'), lv('rapido', 'Rapido'), lv('porter', 'Porter'), lv('shiprocket', 'Shiprocket'), lv('delhivery', 'Delhivery'),
  lv('licious', 'Licious'), lv('healthifyme', 'HealthifyMe'), lv('curefit', 'Cult.fit'), lv('instamojo', 'Instamojo'), lv('paytm', 'Paytm'), lv('nykaa', 'Nykaa'),
  lv('groww', 'Groww'), lv('dunzo', 'Dunzo'), lv('jar-app', 'Jar'), lv('fi', 'Fi Money'), lv('smallcase', 'smallcase'), lv('pocketfm', 'Pocket FM'),
  lv('kukufm', 'Kuku FM'), lv('apna', 'apna'), lv('scaler', 'Scaler'), lv('masaischool', 'Masai School'), lv('eightfold', 'Eightfold'),
  ab('zepto', 'Zepto'), ab('atlan', 'Atlan'), ab('rippling', 'Rippling'), ab('sarvam', 'Sarvam AI'), ab('ramp', 'Ramp'), ab('deel', 'Deel'), ab('postman', 'Postman'),
  ab('groww', 'Groww'), ab('cred', 'CRED'), ab('plum', 'Plum'), ab('sprinto', 'Sprinto'), ab('rocketlane', 'Rocketlane'),
];
