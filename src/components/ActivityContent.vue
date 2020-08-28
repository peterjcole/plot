iuy 2234576
<template>
  <div class="content">
    <p>
      <strong>
        <span>{{ activity.name }}</span>
        <span class="icon"> <font-awesome-icon v-if="activityIcon" :icon="activityIcon" /> </span>
      </strong>
      <br />
      <small>
        <Timeago :datetime="activity.start_date_local" />
      </small>
      <br />
      <small>{{ `${distanceInKms} km` }}</small>
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
    },
  },
  computed: {
    distanceInKms() {
      return Number.parseFloat(this.activity.distance / 1000).toFixed(2)
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
button {
  all: unset;
  padding: 10px;
}

.icon {
  padding-left: 3px;
  position: relative;
  top: 2px;
}
</style>
