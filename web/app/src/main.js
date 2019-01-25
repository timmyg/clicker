import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './state/store';
import axios from 'axios';
import VueSegment from 'vue-segment-analytics';

Vue.prototype.$http = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 6000,
});

Vue.use(VueSegment, { id: process.env.VUE_APP_SEGMENT_KEY, router });
const { $segment } = Vue.prototype
$segment.identify();
router.afterEach((to) => { 
  $segment.page(to.name);
})

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
