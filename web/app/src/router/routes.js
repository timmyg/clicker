// import Dashboard from '../components-old/Dashboard';
// import Login from '../components-old/LogIn';
import Brand from '../components/Brand';
import Landing from '../components/landing/Landing';
import Pay from '../components/Pay';
import Privacy from '../components/Privacy';
import PrivacyApp from '../components/PrivacyApp';
import List from '../components/blog/List';
import Post from '../components/blog/Post';

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
    path: '/blog',
    name: 'blog',
    component: List,
  },
  {
    path: '/blog/:slug',
    name: 'post',
    component: Post,
  },
];
