import Dashboard from '../components/Dashboard';
import Login from '../components/LogIn';
import Landing from '../components/Landing';
import Privacy from '../components/Privacy';
import PrivacyApp from '../components/PrivacyApp';
import { CLIENT_RENEG_LIMIT } from 'tls';

export default [
  {
    path: '/',
    name: 'landing',
    component: Landing,
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: Privacy,
  },
  {
    path: '/app/privacy',
    name: 'app-privacy',
    component: PrivacyApp,
  },
  {
    path: '/app/auth',
    name: 'app-auth',
    beforeEnter(to, from, next) {
      alert('clicker://tabs/profile/logging-in' + window.location.hash);
      window.location = 'clicker://tabs/profile/logging-in' + window.location.hash;
    },
  },
  {
    path: '/dev/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      authRequired: true,
    },
  },
  {
    path: '/dev/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/404',
    name: '404',
    component: 404,
    props: true,
  },
];
