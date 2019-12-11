import { createClient } from './plugins/contentful.js';
const path = require('path');

let dynamicRoutes = () => {
  const client = createClient();
  return Promise.all([
    client.getEntries({
      content_type: 'blogPost',
      order: '-sys.createdAt',
    }),
  ])
    .then(([posts]) => {
      return posts.items.map(post => `/blog/${post.fields.slug}`);
    })
    .catch(e => console.error(e));
};

module.exports = {
  mode: 'spa',

  generate: {
    routes: dynamicRoutes,
  },
  modules: ['@nuxtjs/markdownit', '@nuxtjs/style-resources', '@nuxt/http', '@nuxtjs/dotenv'],
  plugins: ['~/plugins/vue-moment.js', '~/plugins/filters.js'],
  css: [
    '~assets/scss/style.scss',
    // '~assets/css/tailwind.css',
    // '@/assets/vendor/wirecss/scss/wire.scss'
  ],

  /*
   ** Headers of the page
   */
  head: {
    title: 'Clicker: Sports Programming Management Platform',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'TV sports programming platform and app ensuring the best, most relevant games are on at all times',
      },
      { name: 'fragment', content: '!' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: 'https://clicker-brand.s3.amazonaws.com/favicon.ico' }],
  },
  /*
   ** Customize the progress bar color
   */
  loading: { color: '#3B8070' },
  /*
   ** Build configuration
   */
  build: {
    postcss: {
      plugins: {
        tailwindcss: path.resolve(__dirname, './tailwind.config.js'),
      },
    },
    /*
     ** Run ESLint on save
     */
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        });
      }
    },
  },
  markdownit: {
    injected: true,
    html: true,
  },
};
