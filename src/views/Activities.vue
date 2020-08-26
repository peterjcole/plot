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
              :selected="isSelected(activity)"
              @select-activity="selectActivity"
            />
          </div>
        </div>
        <div class="column">
          <div class="box">
            <Map :activity="selectedActivity" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios'

import Activity from '../components/Activity'
import Map from '../components/Map'

export default {
  components: {
    Activity,
    Map,
  },
  data: () => {
    return {
      activities: { data: [] },
      selectedActivity: {},
    }
  },
  computed: {
    token() {
      return localStorage.getItem('token')
    },
  },
  mounted() {
    this.getActivities()
  },
  methods: {
    getActivities() {
      // eslint-disable-next-line no-debugger
      // debugger
      const headers = {
        Authorization: `Bearer ${this.token}`,
      }
      axios
        .get('https://www.strava.com/api/v3/athlete/activities?per_page=30', { headers })
        .then((res) => {
          this.activities = res
        })
    },
    selectActivity(id) {
      const headers = {
        Authorization: `Bearer ${this.token}`,
      }
      axios
        .get(
          `https://www.strava.com/api/v3/activities/${id}/streams?keys=latlng,id&key_by_type=true`,
          { headers }
        )
        .then((result) => {
          this.selectedActivity = { ...result.data, id }
        })
    },
    isSelected(activity) {
      return activity && this.selectedActivity && activity.id === this.selectedActivity.id
    },
  },
}
</script>

<style lang="scss" scoped>
.box {
  height: 75vh;
  padding: 0.75rem;
  &.activity-list {
    overflow: scroll;
  }
}
</style>
