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
