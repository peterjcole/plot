<template>
  <section class="section">
    <div class="container">
      <div class="content is-large">
        <h1>plot</h1>
        <blockquote>View your Strava activities on an Ordnance Survey map</blockquote>
        <p>Click login to get started!</p>
        <router-link class="button is-primary" to="/login">
          <strong>Login</strong>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Home',
}
</script>
