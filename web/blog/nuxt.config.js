import { createClient } from './plugins/contentful.js';

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
  modules: ['@nuxtjs/markdownit'],
  plugins: ['~/plugins/vue-moment.js'],
  /*
   ** Headers of the page
   */
  head: {
    title: 'blog',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'clicker blog' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  /*
   ** Customize the progress bar color
   */
  loading: { color: '#3B8070' },
  /*
   ** Build configuration
   */
  build: {
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
