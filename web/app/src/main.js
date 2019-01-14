import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './state/store';
import axios from 'axios';

console.log(process.env.VUE_APP_API_URL);
Vue.prototype.$http = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 3000,
  headers: { 'X-Custom-Header': 'foobar' },
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
