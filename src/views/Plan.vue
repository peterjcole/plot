<template>
  <div>
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-1">
            Heatmap & planner
          </h1>
          <p>Click the 🗺 icon on the map to choose a heatmap layer.</p>
        </div>
      </div>
    </section>
    <div class="container">
      <div class="columns is-gapless">
        <div class="column">
          <div class="box plan-map">
            <TheMap ref="map" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TheMap from '@/components/OpenLayersMap'

export default {
  name: 'Plan',
  components: {
    TheMap,
  },
  beforeRouteLeave (to, from, next) {
    console.log('before route leave')
    if (this.$refs.map.drawLength && !confirm('Are you sure you want to lose your route?')) {
      return false
    } else {
      next()
    }
  },
  data: () => {
    return {}
  },
  computed: {
  },
  methods: {
  },
}
</script>

<style lang='scss' scoped>
@import '~bulma/bulma.sass';

.plan-map {
  height: 100vh;
  padding: 0.75rem;
  margin-bottom: 150px;

  @include from($tablet) {
    height: 90vh;
  }
}
</style>
