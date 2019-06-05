import Dashboard from '../components/Dashboard';
import Login from '../components/LogIn';
import Landing from '../components/Landing';

export default [
  {
    path: '/',
    name: 'landing',
    component: Landing,
  },
  {
    path: '/dev/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      authRequired: true,
    },
  },
  {Î
    path: '/dev/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/app',
    beforeEnter() {
      window.location = process.env.VUE_APP_MOBILE_URL;
    },
  },
  {
    path: '/404',
    name: '404',
    component: 404,
    props: true,
  },
];
