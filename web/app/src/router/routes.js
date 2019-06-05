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
