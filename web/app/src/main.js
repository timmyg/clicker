import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './state/store';
import axios from 'axios';

Vue.prototype.$http = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 6000,
});

import VueMultianalytics from 'vue-multianalytics'

const ga = {
  appName: 'tryclicker.com',
  appVersion: '0.1',
  trackingId: process.env.VUE_APP_GOOGLE_ANALYTICS_KEY,
}

const mixpanel = {
  token: process.env.VUE_APP_MIXPANEL_KEY
}


Vue.use(VueMultianalytics, {
  modules: {
    ga,
    mixpanel,
  }
})

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
