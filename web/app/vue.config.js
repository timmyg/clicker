const PrerenderSpaPlugin = require('prerender-spa-plugin');
const path = require('path');

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "@/assets/scss/style.scss";
          @import "~vue2-animate/src/sass/vue2-animate.scss";
        `,
      },
    },
  },
  configureWebpack: {
    plugins: [
      new PrerenderSpaPlugin({
        // Required - The path to the webpack-outputted app to prerender.
        staticDir: path.join(__dirname, 'dist'),
        // Required - Routes to render.
        routes: ['/'],
      }),
    ],
  },
  chainWebpack: config => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule.use('vue-svg-loader').loader('vue-svg-loader');
  },
};
