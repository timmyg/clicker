const PrerenderSpaPlugin = require('prerender-spa-plugin');
const path = require('path');
const Renderer = PrerenderSpaPlugin.PuppeteerRenderer;

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "@/assets/scss/style.scss";
          @import "~vue-ionicons/ionicons.scss";
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
        routes: [
          '/',
          '/brand',
          '/privacy',
          '/app/privacy',
          '/blog',
          '/blog/sports-gambling-50-states',
          '/blog/control-center-schedule-august31-september6',
          '/blog/control-center-schedule-september7-september13',
          '/blog/control-center-schedule-september14-september20',
          '/blog/control-center-schedule-september21-september27',
          '/blog/control-center-schedule-september28-october4',
          '/blog/control-center-schedule-october5-october11',
          '/blog/control-center-schedule-october12-october18',
          '/blog/control-center-schedule-october19-october25',
          '/blog/control-center-schedule-october26-november1',
          '/blog/control-center-schedule-november2-november8',
          '/blog/control-center-schedule-november9-november15',
          '/blog/control-center-schedule-november16-november22',
          '/blog/control-center-schedule-november23-november29',
          '/blog/control-center-schedule-november30-december6',
          '/blog/control-center-schedule-december7-december13',
          '/blog/control-center-schedule-december14-december20',
          '/blog/control-center-schedule-december21-december27',
          '/blog/control-center-schedule-december28-january3',
          '/blog/control-center-schedule-january4-january10',
        ],
        renderer: new Renderer({ renderAfterTime: 5000 }),
      }),
    ],
  },
  chainWebpack: config => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule.use('vue-svg-loader').loader('vue-svg-loader');
  },
};
