<template>
  <div>
    <p class="mb-2">
      <strong>
        <span class="name">{{ route.name }}</span>
        <span class="icon">
          <font-awesome-icon
            v-if="activityIcon"
            :icon="activityIcon"
          />
        </span>
      </strong>
    </p>
    <p class="mb-1">
      <small>
        {{ formattedLastUpdatedDate }}
      </small>
    </p>
    <p class="mb-1">
      <small>{{ formattedDistanceInKms }}</small>
    </p>
    <p>
      <small>{{ formattedElevationGain }}</small>
    </p>
  </div>
</template>

<script>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome"
import dayjs from 'dayjs'

export default {
  name: 'RouteContent',
  components: {
    FontAwesomeIcon
  },
  props: {
    route: {
      type: Object,
      required: true,
    },
  },
  computed: {
    activityIcon() {
      return {
        1: 'biking',
        2: 'running',
      }[this.route.type]
    },
    formattedLastUpdatedDate() {
      return `Last updated: ${dayjs(this.route.updated_at).format('DD/MM/YYYY')}`
    },
    formattedDistanceInKms() {
      return `${Number.parseFloat(this.route.distance / 1000).toFixed(2)} km`
    },
    formattedElevationGain() {
      return `${Math.round(this.route.elevation_gain)}m elevation gain`
    }
  }
}
</script>

<style lang="scss" scoped>
.icon {
  position: relative;
  top: 2px;
}

.name {
  padding-right: 3px;
}
</style>
