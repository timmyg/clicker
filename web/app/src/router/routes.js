// import Dashboard from '../components-old/Dashboard';
// import Login from '../components-old/LogIn';
import Landing from '../components/landing/Landing';
import Pay from '../components/Pay';
import Privacy from '../components/Privacy';
import PrivacyApp from '../components/PrivacyApp';
// import Brand from '../components-old/Brand';

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
  // {
  //   path: '/brand',
  //   name: 'brand',
  //   component: Brand,
  // },
  // {
  //   path: '/dev/dashboard',
  //   name: 'dashboard',
  //   component: Dashboard,
  //   meta: {
  //     authRequired: true,
  //   },
  // },
  // {
  //   path: '/dev/login',
  //   name: 'login',
  //   component: Login,
  // },
  // {
  //   path: '/404',
  //   name: '404',
  //   component: 404,
  //   props: true,
  // },
];
