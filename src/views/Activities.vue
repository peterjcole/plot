<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-1">Activities</h1>
      <div class="columns">
        <div class="column is-one-quarter">
          <div class="box activity-list">
            <Activity
              v-for="(activity, index) in activities.data"
              :key="activity.id"
              :activity="activity"
              :index="index"
            />
          </div>
        </div>
        <div class="column">
          <div class="box">
            <div id="map" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios'

import Activity from '../components/Activity'

export default {

  components: {
    Activity
  },
  data: () => {
    return {
      accessToken: localStorage.token,
      activities: null
    }
  },

  mounted() {
    this.getActivities()
  },

  methods: {
    getActivities() {
      const headers = {
        'Authorization': `Bearer ${localStorage.token}`
      }
      const result = axios.get('https://www.strava.com/api/v3/athlete/activities?per_page=30', { headers }).then(res => {
        this.activities = res
      })

    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  height: 75vh;
  &.activity-list {
    overflow: scroll;
  }
}
</style>
