import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './state/store';
import axios from 'axios';

Vue.prototype.$http = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 3000,
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
