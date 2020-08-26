<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item">
        <h4 class="is-4 title">
          <FontAwesomeIcon icon="map" />
          plot
        </h4>
      </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
      <div class="navbar-start">
        <router-link class="navbar-item" to="/about">Home</router-link>
        <router-link class="navbar-item" to="/">Activities</router-link>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <router-link v-if="!isAuthenticated" class="button is-primary" to="/login">
              <strong>Login</strong>
            </router-link>
            <router-link v-else class="button is-primary" to="/logout">
              <strong>Log Out</strong>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { store } from '../store'

export default {
  components: {
    FontAwesomeIcon,
  },
  computed: {
    isAuthenticated() {
      return store.tokenExpiry > Date.now() / 1000
    },
  },
}
</script>
