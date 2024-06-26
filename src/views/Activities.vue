<template>
  <div>
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-1">
            Activities
          </h1>
        </div>
      </div>
    </section>
    <div class="container">
      <div class="columns is-gapless">
        <div class="column is-one-quarter">
          <div class="box activity-list">
            <ListItem
              v-for="(activity, index) in activities.data"
              :id="activity.id.toString()"
              :key="activity.id"
              :item-details="activity"
              :index="index"
              :selected="isSelected(activity)"
              :show-share-button="true"
              @select="selectActivity"
              @share="uploadActivity"
            >
              <ActivityContent :activity="activity" />
            </ListItem>
            <infinite-loading
              spinner="spiral"
              @infinite="infiniteHandler"
            />
          </div>
        </div>
        <div class="column is-hidden-tablet">
          <nav class="level gripline">
            <div class="level-item has-text-centered">
              <span class="icon"><font-awesome-icon icon="grip-lines" /></span>
            </div>
          </nav>
        </div>
        <div class="column">
          <div class="box map">
            <TheMap :latlng="selectedLatlng" />
          </div>
        </div>
      </div>
    </div>
    <ShareModal
      v-if="showSharedUrlModal"
      :shared-activity-url="sharedActivityUrl"
      @close-modal="closeModal"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import InfiniteLoading from 'vue-infinite-loading'

import ListItem from '@/components/ListItem'
import ActivityContent from '@/components/ActivityContent'
import TheMap from '@/components/TheMap.vue'
import { db, dbAuth } from '@/db'
import ShareModal from '@/components/ShareModal'
import { latlngToObject, adjectiveAnimal } from '@/utils'
import { store, mutations } from '@/store'

export default {
  name: 'Activities',
  components: {
    ShareModal,
    TheMap,
    ListItem,
    FontAwesomeIcon,
    InfiniteLoading,
    ActivityContent,
  },
  data: () => {
    return {
      activities: { data: [] },
      selectedActivity: { latlng: { data: null } },
      sharedActivityId: null,
      sharedActivity: {},
      showSharedUrlModal: false,
      page: 1,
    }
  },
  computed: {
    webShareApiSupported() {
      return navigator.share
    },
    sharedActivityUrl() {
      return `${window.location.origin}/${this.sharedActivityId}`
    },
    selectedLatlng() {
      return this.selectedActivity.latlng ? this.selectedActivity.latlng.data : null
    },
  },
  methods: {
    async getActivityDetails(id) {
      const headers = {
        Authorization: `Bearer ${store.token}`,
      }

      return axios
        .get(
          `https://www.strava.com/api/v3/activities/${id}/streams?keys=latlng,id&key_by_type=true`,
          { headers }
        )
        .catch((error) => {
          if (error.response.status === 401) {
            mutations.clearToken()
            this.$router.push('/login')
          }
        })
    },
    infiniteHandler($state) {
      const headers = {
        Authorization: `Bearer ${store.token}`,
      }

      const params = {
        page: this.page,
        'per-page': 50,
      }

      axios
        .get('https://www.strava.com/api/v3/athlete/activities', { headers, params })
        .then((res) => {
          if (res.data.length) {
            this.page += 1
            this.activities.data.push(...res.data)
            if (!this.selectedActivity.id) {
              this.selectActivity(res.data[0].id)
            }
            $state.loaded()
          } else {
            $state.complete()
          }
        })
        .catch((error) => {
          if (error.response.status === 401) {
            mutations.clearToken()
            this.$router.push('/login')
          }
        })
    },
    selectActivity(id) {
      this.selectedActivity.id = id

      this.getActivityDetails(id).then((result) => {
        this.selectedActivity = { ...result.data, id }
      })

      document.getElementById('map').scrollIntoView()
    },
    async uploadActivity(id, index) {
      this.getActivityDetails(id).then((result) => {
        const activitiesRef = db.collection('activities')
        activitiesRef
          .where('activityId', '==', id)
          .get()
          .then(async (existing) => {
            if (existing.empty) {
              const dbActivity = this.generateDbActivity(result.data, index)
              let dbId = await this.generateDbId(activitiesRef)
              activitiesRef
                .doc(dbId)
                .set(dbActivity)
                .then(() => {
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
        activityId: activity.id,
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

<style lang="scss" scoped>
.gripline {
  padding: 1.5rem 0;
}
</style>
