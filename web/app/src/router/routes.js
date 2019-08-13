import Dashboard from '../components/Dashboard';
import Login from '../components/LogIn';
import Landing from '../components/Landing';
import Privacy from '../components/Privacy';
import Pay from '../components/Pay';
import Brand from '../components/Brand';
import PrivacyApp from '../components/PrivacyApp';

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
    path: '/pay',
    name: 'pay',
    component: Pay,
  },
  {
    path: '/brand',
    name: 'brand',
    component: Brand,
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
