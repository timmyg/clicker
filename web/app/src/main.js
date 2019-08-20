import Vue from 'vue';
import ContentfulVue from 'contentful-vue';
import App from './App.vue';
import router from './router';
import store from './state/store';
import axios from 'axios';

console.log(process.env.VUE_APP_API_URL);
Vue.prototype.$http = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 8000,
  // responseType: 'json',
});

Vue.use(ContentfulVue, {
  space: 'jaxoslda9dxk',
  accessToken: 'Ai_IJR4RoCAhqsUk4q0NMXcR1ON42EHL02jD9-gjiGE',
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
