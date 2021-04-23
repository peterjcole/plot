<template>
  <div>
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-1">Plot a route</h1>
        </div>
      </div>
    </section>
    <div class="container">
      <div class="box map">
        <Map />
      </div>
    </div>
  </div>
</template>

<script>
import Map from '@/components/Map'

export default {
  name: 'RoutePlotter',
  components: {
    Map,
  },
}
</script>

<style scoped></style>
