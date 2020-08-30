<template>
  <div>
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <nav class="level">
            <div class="level-left">
              <div class="content">
                <h1 class="title is-1">{{ `${activity.name} ` }}</h1>
                <p class="subtitle is-3">
                  {{ ` ${distanceInKms} km` }}
                </p>
                <span class="subtitle is-6">
                  <Timeago :datetime="activity.start_date_local" />
                </span>
              </div>
            </div>
            <div v-if="canDelete" class="level-right">
              <button class="button is-danger" @click="deleteActivity">
                Delete
              </button>
            </div>
          </nav>
        </div>
      </div>
    </section>
    <div class="container">
      <div class="box">
        <Map :activity="{ latlng: { data: latLngArray } }" />
      </div>
    </div>
  </div>
</template>

<script>
import Map from '@/components/Map'
import { dbAuth } from '@/db'

export default {
  name: 'SharedActivity',
  components: {
    Map,
  },
  props: {
    activity: {
      required: true,
      type: Object,
    },
    activitySnapshot: {
      required: true,
      type: Object,
    },
  },
  computed: {
    latLngArray() {
      return this.activity.latlng.map((latlngObject) => [latlngObject.lat, latlngObject.lng])
    },
    distanceInKms() {
      return Number.parseFloat(this.activity.distance / 1000).toFixed(2)
    },
    canDelete() {
      return dbAuth.currentUser && dbAuth.currentUser.uid === this.activity.uid
    },
  },
  methods: {
    deleteActivity() {
      this.canDelete &&
        this.activitySnapshot.ref
          .delete()
          .then(() => {
            this.$router.push('/')
          })
          .catch((err) => alert(err))
    },
  },
}
</script>

<style lang="scss" scoped>
.box {
  height: 75vh;
  padding: 0.75rem;
}

.map-section {
  padding-top: 0;
}

.subtitle {
  display: inline;
}
</style>
