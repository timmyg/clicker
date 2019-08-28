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
          '/blog/control-center-schedule-august17-august18',
          '/blog/control-center-schedule-august23-august24',
          '/blog/control-center-schedule-august30-august31',
          '/blog/control-center-schedule-september6-september7',
          '/blog/control-center-schedule-september13-september14',
          '/blog/control-center-schedule-september20-september21',
          '/blog/control-center-schedule-september27-september28',
          '/blog/control-center-schedule-october4-october5',
          '/blog/control-center-schedule-october11-october12',
          '/blog/control-center-schedule-october18-october19',
          '/blog/control-center-schedule-october25-october26',
          '/blog/control-center-schedule-november1-november2',
          '/blog/control-center-schedule-november8-november9',
          '/blog/control-center-schedule-november15-november16',
          '/blog/control-center-schedule-november22-november23',
          '/blog/control-center-schedule-november29-november30',
          '/blog/control-center-schedule-december6-december7',
          '/blog/control-center-schedule-december13-december14',
          '/blog/control-center-schedule-december20-december21',
          '/blog/control-center-schedule-december27-december28',
          '/blog/control-center-schedule-january3-january4',
          '/blog/control-center-schedule-january10-january11',
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
