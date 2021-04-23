<template>
  <div>
    <hr v-if="notFirst">
    <div>
      <div class="media">
        <div
          class="media-content"
          @click.self="selectActivity"
        >
          <ActivityContent
            :activity="activity"
            :selected="selected"
            v-on="$listeners"
          />
        </div>
        <div class="media-right">
          <div class="content">
            <button
              class="button is-small is-light"
              @click="$emit('share-activity', activity.id, index)"
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
export default {
  name: 'RouteInfo',
  props: {
    route: { type: Object, required: true },
    index: { type: Number, required: true },
    selected: { type: Boolean, required: true }
  },
}
</script>

<style scoped></style>
