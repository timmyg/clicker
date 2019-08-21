import Vue from 'vue';
import ContentfulVue from 'contentful-vue';
import App from './App.vue';
import router from './router';
import store from './state/store';
import axios from 'axios';

Vue.prototype.$http = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 8000,
});

Vue.use(ContentfulVue, {
  space: process.env.VUE_APP_CONTENTFUL_SPACE_ID,
  accessToken: process.env.VUE_APP_CONTENTFUL_API_TOKEN,
});

Vue.filter('truncate', function(text, stop, clamp) {
  return text.slice(0, stop) + (stop < text.length ? clamp || '...' : '');
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
