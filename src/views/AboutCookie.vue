<template>
  <div>
    <section class="section">
      <div class="container">
        <div class="content">
          <h1>Strava cookie instructions</h1>
          <ol>
            <li>Create a new Strava account (just in case)</li>
            <li>Install the <a href="https://chrome.google.com/webstore/detail/josm-strava-heatmap/hicmfobjcbinceoeegookkgllpdgkcdc?hl=en">JOSM Strava Heatmap Chrome Extension</a></li>
            <li>Go to <a href="https://www.strava.com/heatmap">https://strava.com/heatmap</a></li>
            <li>Click on the JOSM icon with 9 squares and copy the URL</li>
            <li>
              Go back to the <router-link to="/plan">
                Heatmap & planner
              </router-link>, click 'Enter Strava cookie', paste it into the box, hit OK
            </li>
            <li>Use the layer switcher to choose a high resolution heatmap layer</li>
          </ol>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'AboutCookie',
  components: {
    // FontAwesomeIcon,
  },
}
</script>

<style lang="scss" scoped>

</style>
