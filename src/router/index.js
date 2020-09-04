import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'

import Home from '../views/About'
import SharedActivity from '../views/SharedActivity'
import {store, mutations} from '@/store'
import {dbAuth, db} from '@/db'

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
      const {code} = to.query
      axios
        .post('/api/token', {
          code,
        })
        .then((res) => {
          mutations.setToken(res.data.access_token, res.data.expires_at)
          window.localStorage.setItem('knownUser', true)
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
    name: 'My Activities',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Activities.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/:id',
    name: 'Shared Activity',
    component: SharedActivity,
    meta: {
      requiresAuth: false,
    },
    beforeEnter: (to, from, next) => {
      db.collection('activities')
        .doc(to.params.id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            mutations.setSharedDocSnapshot(doc)
            next()
          } else {
            next('/')
          }
        })
    },

    props: () => {
      return {
        activity: store.sharedDocSnapshot.data(),
        activitySnapshot: store.sharedDocSnapshot
      }
    },
  },
  {
    path: '/activity/:id',
    redirect: to => {
      return `/${to.params.id}`
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  dbAuth.signInAnonymously()
  if (to.matched.some((record) => record.meta.requiresAuth === true)) {
    mutations.retrieveTokenFromLocalStorage()
    const isAuthenticated = store.tokenExpiry > Date.now() / 1000
    const knownUser = window.localStorage.getItem('knownUser')
    isAuthenticated ? next() : knownUser ? next('/login') : next('/about')
  } else {
    next()
  }
})

export default router
