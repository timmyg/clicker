const path = require("path");
require("dotenv").config();
const contentful = require("contentful");
const client = contentful.createClient({
  space: process.env.NUXT_ENV_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NUXT_ENV_CONTENTFUL_ACCESS_TOKEN
});

let dynamicRoutes = () => {
  console.log("create dynamic routes");
  const client = createClient();
  return Promise.all([
    client.getEntries({
      content_type: "blogPost",
      order: "-fields.date"
    })
  ])
    .then(([posts]) => {
      console.log("routes....");
      return posts.items.map(post => `/blog/${post.fields.slug}`);
    })
    .catch(e => console.error("dynamic routes errpor :(", e));
};
console.log(
  "process.env.NUXT_ENV_SEGMENT_KEY",
  process.env.NUXT_ENV_SEGMENT_KEY
);
module.exports = {
  mode: "spa",

  generate: {
    routes: dynamicRoutes
  },
  modules: [
    "@nuxtjs/dotenv",
    "@nuxtjs/markdownit",
    "@nuxtjs/style-resources",
    "@nuxt/http",
    "@dansmaculotte/nuxt-segment"
  ],
  plugins: ["~/plugins/vue-moment.js", "~/plugins/filters.js"],
  css: [
    "~assets/scss/style.scss"
    // '~assets/css/tailwind.css',
    // '@/assets/vendor/wirecss/scss/wire.scss'
  ],
  segment: {
    writeKey: process.env.NUXT_ENV_SEGMENT_KEY
  },

  /*
   ** Headers of the page
   */
  head: {
    title: "Clicker: Sports Programming Management Platform",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content:
          "TV sports programming platform and app ensuring the best, most relevant games are on at all times"
      },
      { name: "fragment", content: "!" }
    ],
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "https://clicker-brand.s3.amazonaws.com/favicon.ico"
      }
    ]
  },
  /*
   ** Customize the progress bar color
   */
  loading: { color: "#3B8070" },
  /*
   ** Build configuration
   */
  build: {
    postcss: {
      plugins: {
        tailwindcss: path.resolve(__dirname, "./tailwind.config.js")
      }
    },
    /*
     ** Run ESLint on save
     */
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: "pre",
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /(node_modules)/
        });
      }
    }
  },
  markdownit: {
    injected: true,
    html: true
  }
};
