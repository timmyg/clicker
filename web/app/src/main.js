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
const segmentConfig = {
  token: process.env.VUE_APP_SEGMENT_KEY
}
Vue.use(VueMultianalytics, {
  modules: {
    segment: segmentConfig
  },
  routing: {
    vueRouter: router
  },
})

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
