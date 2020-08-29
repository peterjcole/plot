<template>
  <div>
    <section class="section section-padding-mobile">
      <section class="hero">
        <div class="hero-body">
          <div class="container">
            <h1 class="title is-1">Activities</h1>
          </div>
        </div>
      </section>
      <div class="container">
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
                @share-activity="uploadActivity"
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
    <ShareModal v-if="showSharedUrlModal" @close-modal="closeModal" :shared-activity-url="sharedActivityUrl" />
  </div>
</template>

<script>
import axios from 'axios'

import Activity from '../components/Activity'
import Map from '../components/Map'
import { db, dbAuth } from '@/db'
import ShareModal from '@/components/ShareModal'

export default {
  components: {
    ShareModal,
    Activity,
    Map,
  },
  data: () => {
    return {
      activities: { data: [] },
      selectedActivity: {},
      sharedActivityId: null,
      sharedActivity: {},
      showSharedUrlModal: false
    }
  },
  computed: {
    token() {
      return localStorage.getItem('token')
    },
    webShareApiSupported() {
      return navigator.share
    },
    sharedActivityUrl() {
      return `${window.location.origin}/activity/${this.sharedActivityId}`
    },
  },
  mounted() {
    this.getActivities()
  },
  methods: {
    getActivities() {
      const headers = {
        Authorization: `Bearer ${this.token}`,
      }

      axios
        .get('https://www.strava.com/api/v3/athlete/activities?per_page=50', { headers })
        .then((res) => {
          this.activities = res
        })
    },
    getActivityDetails: function (id) {
      const headers = {
        Authorization: `Bearer ${this.token}`,
      }

      return axios.get(
        `https://www.strava.com/api/v3/activities/${id}/streams?keys=latlng,id&key_by_type=true`,
        { headers }
      )
    },
    selectActivity(id) {
      this.getActivityDetails(id).then((result) => {
        this.selectedActivity = { ...result.data, id }
      })

      document.getElementById('map').scrollIntoView()
    },
    uploadActivity(id, index) {
      this.getActivityDetails(id).then((result) => {
        const activitiesRef = db.collection('activities')
        activitiesRef.where("id", "==", id).get().then(existing => {
          if (existing.empty) {
            const dbActivity = this.generateDbActivity(result.data, index)
            activitiesRef
              .add(dbActivity)
              .then((docRef) => {
                this.sharedActivityId = docRef.id
                this.sharedActivity = dbActivity
                this.shareActivity()
              })
          } else {
            this.sharedActivityId = existing.docs[0].id
            this.sharedActivity = existing.docs[0].data()
            this.shareActivity()
          }
        })
      })
    },
    shareActivity() {
      if (this.webShareApiSupported) {
        navigator.share({
          title: `${this.sharedActivity.name} on plot`,
          text: `View my Strava activity, ${this.sharedActivity.name}, on an OS map!`,
          url: this.sharedActivityUrl
        })
      } else {
        this.showSharedUrlModal = true
      }
    },
    generateDbActivity(locationData, index) {
      const activity = this.activities.data[index]

      return {
        latlng: this.latlngToObject(locationData.latlng.data),
        name: activity.name,
        distance: activity.distance,
        start_date_local: activity.start_date_local,
        uid: dbAuth.currentUser.uid
      }
    },
    isSelected(activity) {
      return activity && this.selectedActivity && activity.id === this.selectedActivity.id
    },
    latlngToObject(latlngArray) {
      return latlngArray.map((latlng) => {
        return {
          lat: latlng[0],
          lng: latlng[1],
        }
      })
    },
    closeModal() {
      this.showSharedUrlModal = false
    },
  },
}
</script>

<style lang="scss" scoped>
.box {
  height: 75vh;
  padding: 0.75rem;

  &.activity-list {
    overflow-x: hidden;
    overflow-y: scroll;
  }
}
</style>
