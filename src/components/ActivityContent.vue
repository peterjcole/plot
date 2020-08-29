<template>
  <div
    class="content"
    :class="{ selected: selected }"
    tabindex="0"
    @keydown="selectActivity"
    @mousedown="selectActivity"
  >
    <p>
      <strong>
        <span class="activity-name">{{ activity.name }}</span>
        <span class="icon">
          <font-awesome-icon v-if="activityIcon" :icon="activityIcon" />
        </span>
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
    selected: {
      type: Boolean,
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
  methods: {
    selectActivity(e) {
      if (e.keyCode == 32 || e.type === 'mousedown') {
        e.preventDefault()
        this.$emit('select-activity', this.activity.id)
      }
    },
    // cancelOutline(e) {
    // }
  },
}
</script>
<style lang="scss" scoped>
.content {
  border-radius: 5px;

  &:hover {
    background-color: whitesmoke;
  }

  &:active {
    background-color: lightgrey;
    outline-color: darkgrey;
  }

  &:focus {
    outline-color: darkgrey;
  }

  &.selected {
    background-color: whitesmoke;
  }

  padding: 10px 10px 10px 15px;
}

.icon {
  position: relative;
  top: 2px;
}

.activity-name {
  padding-right: 3px;
}
</style>
