<template>
  <div>
    <p class="mb-1">
      <strong>
        <span class="activity-name">{{ activity.name }}</span>
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
        <Timeago :datetime="activity.start_date_local" />
      </small>
    </p>
    <p>
      <small>{{ formattedDistanceInKms }}</small>
    </p>
  </div>
</template>
<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'ActivityContent',
  components: {
    FontAwesomeIcon,
  },
  props: {
    activity: {
      type: Object,
      required: true,
    }
  },
  computed: {
    formattedDistanceInKms() {
      return `${Number.parseFloat(this.activity.distance / 1000).toFixed(2)} km`
    },
    activityIcon() {
      return {
        Run: 'running',
        Ride: 'biking',
      }[this.activity.type]
    },
  },
}
</script>
<style lang="scss" scoped>
.icon {
  position: relative;
  top: 2px;
}

.activity-name {
  padding-right: 3px;
}
</style>
