import Vue from 'vue';
import Router from 'vue-router';
// import VueScrollReveal from 'vue-scroll-reveal';
import store from '../state/store';
import routes from './routes';

Vue.use(Router);
Vue.use(require('vue-moment'));
// Vue.use(VueScrollReveal, {
//   class: 'v-scroll-reveal', // A CSS class applied to elements with the v-scroll-reveal directive; useful for animation overrides.
//   duration: 800,
//   scale: 1,
//   distance: '10px',
//   mobile: false,
//   // origin: 'left',
// });

const router = new Router({
  routes,
  mode: 'history',
});

router.beforeEach((to, from, next) => {
  const authRequired = to.matched.some(route => route.meta.authRequired);
  if (!authRequired) return next();

  if (store.getters['auth/loggedIn']) {
    // Validate the local user token...
    return store.dispatch('auth/validate').then(validUser => {
      // Then continue if the token still represents a valid user,
      // otherwise redirect to login.
      validUser ? next() : redirectToLogin();
    });
  }

  // If auth is required and the user is NOT currently logged in,
  // redirect to login.
  redirectToLogin();

  function redirectToLogin() {
    // Pass the original route to the login component
    next({ name: 'login', query: { redirectFrom: to.fullPath } });
  }
});

export default router;
