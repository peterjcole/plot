import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'

import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/login',
    beforeEnter: () => {
      console.log('wuh')
      const stravaUrl = new URL('https://www.strava.com/oauth/authorize')
      stravaUrl.searchParams.append('client_id', process.env.VUE_APP_STRAVA_CLIENT_ID)
      stravaUrl.searchParams.append('redirect_uri', `${window.location.origin}/redirect`)
      stravaUrl.searchParams.append('response_type', 'code')
      stravaUrl.searchParams.append('scope', 'activity:read')
      stravaUrl.searchParams.append('approval_prompt', 'auto')
      window.location.replace(stravaUrl)
    },
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/redirect',
    beforeEnter: (to, from, next) => {
      const { code } = to.query
      axios.post('/api/token', {
        code,
      }).then(res => {
        localStorage.token = res.data.access_token
        localStorage.tokenExpiry = res.data.expires_at
        next('/activities')
      }).catch(err => {
        console.log(err)
        next('/login')
      })
    },
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/activities',
    name: 'Activities',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Activities.vue'),
    meta: {
      requiresAuth: true
    }
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth === true)) {
    const isAuthenticated = localStorage.tokenExpiry > (Date.now() / 1000)
    isAuthenticated ? next() : next('/login')
  }
  next()
})

export default router
