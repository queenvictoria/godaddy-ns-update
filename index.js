require('dotenv').config()

// Default GoDaddy API doesn't let us configure OTE environment.
// const GoDaddy = require('godaddy-api');
// godaddy = GoDaddy(process.env.API_KEY, process.env.API_SECRET);

const gd_domains = require('./node_modules/godaddy-api/lib/domains').domains;
const Bottleneck = require('bottleneck');

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000
});

const data = require('./data/domains.json');

// OTE doesn't have our domains in it's account. It only has test domains.
const basePath = {
  ote: 'https://api.ote-godaddy.com',
  production: 'https://api.godaddy.com'
};

// OTE or Prod
const production = true;

const Authorization = `sso-key ${process.env.API_KEY}:${process.env.API_SECRET}`;
const domainOrOptions = {
  token: {
    value: Authorization,
    headerOrQueryName: 'Authorization'
  },
  domain: production ? basePath.production : basePath.ote,
}
domainsAPI =  new gd_domains(domainOrOptions);


Object.keys(data).forEach(domain => {
  updateNS(domain, data[domain]);
});


/*
 * Accepts a domain and a data object.
 * The data object should contain a property 'NS' which is an array of nameservers.
 */
function updateNS(domain, data) {
  // Get a domain
  // domainsAPI.get({domain: domain})
  limiter.schedule(() => domainsAPI.get({domain: domain})
    .then(res => {
      // Examine it's NS record
      // If our nameServers are houseoflaudanum then update to our new ones.
      if ( res.body && res.body.nameServers && res.body.nameServers.pop().toLowerCase().indexOf('houseoflaudanum') > 0 ) {
        const params = {domain: domain, body:{nameServers: data.NS}};
        // Update it's NS record
        return domainsAPI.update(params);
      }
      else if ( res.body && res.body.nameServers && res.body.nameServers.pop().toLowerCase().indexOf('googledomains') > 0 ) {
        console.error(`${domain} already updated. SKIPPING.`);
        return res;
      }
      else {
        if ( res.body && res.body.status)
          console.error(`${domain} did not use houseoflaudanum NS (${res.body.status}). SKIPPING.`);
        else
          console.error(`${domain} did not use houseoflaudanum NS. SKIPPING.`);
        return res;
      }
    })
    .catch(err => {
      if ( err.body ) {
        if ( err.body.message && err.body.message.indexOf('not found for shopper') )
          console.error(`${domain} not in this account. SKIPPING.`)
        else {
          console.error(`Error for ${domain}.`);
          console.error(err.body);
        }
      }
      else {
        console.error(`Error for ${domain}.`);
        console.error(err);
      }
    })
  );
}
