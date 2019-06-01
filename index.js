require('dotenv').config()

// Default GoDaddy API doesn't let us configure OTE environment.
// const GoDaddy = require('godaddy-api');
// godaddy = GoDaddy(process.env.API_KEY, process.env.API_SECRET);

const gd_domains = require('./node_modules/godaddy-api/lib/domains').domains;

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


// const domain = 'agentallblack.com'
// updateNS(domain, data[domain]);

Object.keys(data).forEach(domain => {
  updateNS(domain, data[domain]);
});


function updateNS(domain, data) {
  console.log(`Updating ${domain}.`);
// Get a domain

  domainsAPI.get({domain: domain})
    .then(res => {
      // Examine it's NS record
      // If our nameServers are houseoflaudanum then update to our new ones.
      if ( res.body && res.body.nameServers.pop().toLowerCase().indexOf('houseoflaudanum') > 0 ) {
        const params = {domain: domain, body:{nameServers: data.NS}};
        // Update it's NS record
        return domainsAPI.update(params);
      }
      else {
        console.error(`${domain} did not use houseoflaudanum NS. SKIPPING.`);
        return res;
      }
    })
    .then(res => {
      if ( res && res.body && res.body.nameServers)
        console.log(res.body.nameServers);
      else
        console.log(res.body);
    })
    .catch(err => {
      console.error("err");
      if ( err.body )
        console.error(err.body);
      else
        console.error(err);
    })
}
