import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './state/store';
import axios from 'axios';
import VueMultianalytics from 'vue-multianalytics'

Vue.prototype.$http = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 6000,
});

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
