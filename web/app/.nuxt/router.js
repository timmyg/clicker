import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _18eab127 = () => interopDefault(import('../pages/blog/index.vue' /* webpackChunkName: "pages/blog/index" */))
const _67ccbb75 = () => interopDefault(import('../pages/brand.vue' /* webpackChunkName: "pages/brand" */))
const _22593bb0 = () => interopDefault(import('../pages/demo/index.vue' /* webpackChunkName: "pages/demo/index" */))
const _cd9234d4 = () => interopDefault(import('../pages/pay.vue' /* webpackChunkName: "pages/pay" */))
const _1a3e390e = () => interopDefault(import('../pages/privacy/index.vue' /* webpackChunkName: "pages/privacy/index" */))
const _73c00116 = () => interopDefault(import('../pages/scoreboard.vue' /* webpackChunkName: "pages/scoreboard" */))
const _497cd300 = () => interopDefault(import('../pages/support/index.vue' /* webpackChunkName: "pages/support/index" */))
const _707aed08 = () => interopDefault(import('../pages/privacy/app.vue' /* webpackChunkName: "pages/privacy/app" */))
const _17340fdf = () => interopDefault(import('../pages/blog/_slug.vue' /* webpackChunkName: "pages/blog/_slug" */))
const _6697fb40 = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

// TODO: remove in Nuxt 3
const emptyFn = () => {}
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onComplete = emptyFn, onAbort) {
  return originalPush.call(this, location, onComplete, onAbort)
}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: decodeURI('/'),
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/blog",
    component: _18eab127,
    name: "blog"
  }, {
    path: "/brand",
    component: _67ccbb75,
    name: "brand"
  }, {
    path: "/demo",
    component: _22593bb0,
    name: "demo"
  }, {
    path: "/pay",
    component: _cd9234d4,
    name: "pay"
  }, {
    path: "/privacy",
    component: _1a3e390e,
    name: "privacy"
  }, {
    path: "/scoreboard",
    component: _73c00116,
    name: "scoreboard"
  }, {
    path: "/support",
    component: _497cd300,
    name: "support"
  }, {
    path: "/privacy/app",
    component: _707aed08,
    name: "privacy-app"
  }, {
    path: "/blog/:slug",
    component: _17340fdf,
    name: "blog-slug"
  }, {
    path: "/",
    component: _6697fb40,
    name: "index"
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
