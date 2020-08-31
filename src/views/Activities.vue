<template>
  <div>
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
        <div class="column is-hidden-desktop">
          <nav class="level">
            <div class="level-item has-text-centered">
              <span class="icon"><font-awesome-icon icon="grip-lines" /></span>
            </div>
          </nav>
        </div>
        <div class="column map">
          <div class="box map">
            <Map :activity="selectedActivity" />
          </div>
        </div>
      </div>
    </div>
    <ShareModal
      v-if="showSharedUrlModal"
      @close-modal="closeModal"
      :shared-activity-url="sharedActivityUrl"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import Activity from '../components/Activity'
import Map from '../components/Map'
import { db, dbAuth } from '@/db'
import ShareModal from '@/components/ShareModal'
import { latlngToObject, adjectiveAnimal } from "@/utils"

export default {
  components: {
    ShareModal,
    Activity,
    Map,
    FontAwesomeIcon,
  },
  data: () => {
    return {
      activities: { data: [] },
      selectedActivity: {},
      sharedActivityId: null,
      sharedActivity: {},
      showSharedUrlModal: false,
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
      return `${window.location.origin}/${this.sharedActivityId}`
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
    async getActivityDetails(id) {
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
    async uploadActivity(id, index) {
      this.getActivityDetails(id).then((result) => {
        const activitiesRef = db.collection('activities')
        activitiesRef
          .where('id', '==', id)
          .get()
          .then(async (existing) => {
            if (existing.empty) {
              const dbActivity = this.generateDbActivity(result.data, index)
              let dbId = await this.generateDbId(activitiesRef)
              activitiesRef.doc(dbId).set(dbActivity).then(() => {
                this.sharedActivityId = dbId
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
    async generateDbId(collectionRef) {
      let id = adjectiveAnimal()
      let unique = false
      while (!unique) {
        const doc = await collectionRef.doc(id).get()
        if (!doc.exists) {
          unique = true
        } else {
          id = adjectiveAnimal()
        }
      }
      return id
    },
    shareActivity() {
      if (this.webShareApiSupported) {
        navigator.share({
          title: `${this.sharedActivity.name} on plot`,
          text: `View my Strava activity, ${this.sharedActivity.name}, on an OS map!`,
          url: this.sharedActivityUrl,
        })
      } else {
        this.showSharedUrlModal = true
      }
    },
    generateDbActivity(locationData, index) {
      const activity = this.activities.data[index]

      return {
        latlng: latlngToObject(locationData.latlng.data),
        name: activity.name,
        distance: activity.distance,
        start_date_local: activity.start_date_local,
        uid: dbAuth.currentUser.uid,
      }
    },
    isSelected(activity) {
      return activity && this.selectedActivity && activity.id === this.selectedActivity.id
    },
    closeModal() {
      this.showSharedUrlModal = false
    },
  },
}
</script>
