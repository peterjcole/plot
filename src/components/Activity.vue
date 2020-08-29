<template>
  <div>
    <hr v-if="notFirst" />
    <div>
      <div class="media">
        <div class="media-content" @click.self="selectActivity">
          <ActivityContent :activity="activity" :selected="selected" v-on="$listeners" />
        </div>
        <div class="media-right">
          <div class="content">
            <button
              class="button is-small is-light"
              v-on:click="$emit('share-activity', activity.id, index)"
            >
              <span class="icon">
                <font-awesome-icon icon="share-alt" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import ActivityContent from '@/components/ActivityContent'

export default {
  data() {
    return {
      activityId: null,
    }
  },
  components: { ActivityContent, FontAwesomeIcon },
  props: {
    activity: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    selected: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    notFirst() {
      return this.index !== 0
    },
  },
}
</script>

<style lang="scss" scoped>
.media-right {
  padding: 10px 10px 10px 0px;
}
</style>
