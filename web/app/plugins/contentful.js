const contentful = require("contentful");

// use default environment config for convenience
// these will be set via 'env' property in nuxt.config.js
console.log(process.env);
const config = {
  space: process.env.NUXT_ENV_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NUXT_ENV_CONTENTFUL_ACCESS_TOKEN
};

// export 'createClient' to use it in page components

module.exports = {
  createClient() {
    return contentful.createClient(config);
  }
};
