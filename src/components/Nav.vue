<template>
  <nav
    class="navbar main-nav"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <router-link
        class="navbar-item"
        to="/about"
      >
        <h4 class="is-4 title">
          <FontAwesomeIcon icon="map" />&nbsp;
          plot
        </h4>
      </router-link>
    </div>

    <div class="navbar-menu is-active">
      <div class="navbar-start">
        <router-link
          class="navbar-item"
          to="/"
        >
          My activities
        </router-link>
        <router-link
          class="navbar-item"
          to="/routes"
        >
          My routes
        </router-link>
        <router-link
          class="navbar-item"
          to="/plan"
        >
          Heatmap & planner
        </router-link>
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
<style lang="scss" scoped>
.main-nav {
  overflow-x: auto;
  width: 100%;
}
</style>


