<template>
  <div>
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-1">
            Heatmap
          </h1>
          <p>Click the 🗺 icon to choose a heatmap layer.</p>
        </div>
      </div>
    </section>
    <div class="container">
      <div class="columns is-gapless">
        <div class="column">
          <div class="box map">
            <Map />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Map from '@/components/OpenLayersMap'

export default {
  name: 'Plan',
  components: {
    Map,
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

</style>
