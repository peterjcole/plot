<template>
  <div>
    <hr v-if="notFirst">
    <div>
      <div class="media">
        <div class="media-content">
          <button
            class="item-button"
            :class="{ selected: selected }"
            tabindex="0"
            @click="$emit('select', id)"
          >
            <slot />
          </button>
        </div>
        <div
          v-if="showShareButton"
          class="media-right"
        >
          <div class="content">
            <button
              class="button is-small is-light"
              @click="$emit('share', id, index)"
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

export default {
  components: { FontAwesomeIcon },
  props: {
    itemDetails: {
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
    showShareButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      activityId: null,
    }
  },
  computed: {
    notFirst() {
      return this.index !== 0
    },
  },
}
</script>

<style lang="scss" scoped>
.item-button {
  border-radius: 5px;
  background: transparent;
  border: none;
  margin: 0;
  width: 100%;
  overflow: visible;
  text-align: left;
  font-size: inherit;
  font: inherit;
  line-height: normal;
  cursor: pointer;


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

  padding: 10px 10px 15px 15px;
}


.media-right {
  padding: 10px 10px 10px 0px;
}
</style>
