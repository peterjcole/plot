import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'

import Home from '../views/Home.vue'
import { store, mutations } from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/about',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/login',
    beforeEnter: () => {
      const stravaUrl = new URL('https://www.strava.com/oauth/authorize')
      stravaUrl.searchParams.append('client_id', process.env.VUE_APP_STRAVA_CLIENT_ID)
      stravaUrl.searchParams.append('redirect_uri', `${window.location.origin}/redirect`)
      stravaUrl.searchParams.append('response_type', 'code')
      stravaUrl.searchParams.append('scope', 'activity:read')
      stravaUrl.searchParams.append('approval_prompt', 'auto')
      window.location.replace(stravaUrl)
    },
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/logout',
    beforeEnter: (to, from, next) => {
      mutations.clearToken()
      next('/about')
    },
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/redirect',
    beforeEnter: (to, from, next) => {
      const { code } = to.query
      axios
        .post('/api/token', {
          code,
        })
        .then((res) => {
          mutations.setToken(res.data.access_token, res.data.expires_at)
          next('/')
        })
        .catch((err) => {
          console.log(err)
          next('/login')
        })
    },
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/',
    name: 'Activities',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Activities.vue'),
    meta: {
      requiresAuth: true,
    },
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth === true)) {
    mutations.retrieveTokenFromLocalStorage()
    // eslint-disable-next-line no-debugger
    // debugger
    const isAuthenticated = store.tokenExpiry > Date.now() / 1000
    isAuthenticated ? next() : next('/about')
  }
  next()
})

export default router
