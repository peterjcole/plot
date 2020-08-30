<template>
  <div>
    <section class="section">
      <div class="container">
        <div class="content is-large">
          <h1>plot</h1>
          <blockquote>View your Strava activities on an Ordnance Survey map</blockquote>
          <p>Click below to get started!</p>
          <router-link class="button is-primary" to="/login">
            <span class="icon"><font-awesome-icon :icon="['fab', 'strava']"/></span>
            <strong>Connect to Strava</strong>
          </router-link>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <footer class="footer">
          <div class="content has-text-centered">
            <p>
              <strong>Plot</strong> by <a href="https://github.com/peterjcole">Peter Cole</a>.
              <span class="icon nudge-icon"><font-awesome-icon :icon="['fab', 'github']"/></span>
              <a href="https://github.com/peterjcole/plot"
                >Github project</a
              >.
            </p>
          </div>
        </footer>
      </div>
    </section>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'Home',
  components: {
    FontAwesomeIcon,
  },
}
</script>

<style lang="scss" scoped>
.nudge-icon {
  position: relative;
  top: 2px;
}
</style>
