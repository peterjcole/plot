<template>
  <div>
    <hr v-if="notFirst" />

    <div class="activity">
      <button @click="selectActivity">
        <div class="media">
          <div class="media-content">
            <div class="content">
              <p>
                <strong>{{ activity.name }}</strong>
                <br />
                <small>{{ `${activity.start_date_local}` }}</small>
                <br />
                <small>{{ `${activity.distance}m` }}</small>
                <br />
                {{ activity.location_country }}
              </p>
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    activity: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  computed: {
    notFirst() {
      return this.index !== 0
    },
  },
  methods: {
    selectActivity() {
      this.$emit('select-activity', this.activity.id)
    },
  },
}
</script>

<style lang="scss" scoped>
button {
  all: unset;
  padding: 10px;
}

.activity {
  border-radius: 5px;

  &:hover {
    background-color: whitesmoke;
  }

  &:active {
    background-color: lightgrey;
  }
}
</style>
