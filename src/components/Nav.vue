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

    <div class="navbar-menu is-active">
      <div class="navbar-start">
        <router-link class="navbar-item" to="/about">Home</router-link>
        <router-link class="navbar-item" to="/">Activities</router-link>
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
