<template>
  <div>
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-1">
            Routes
          </h1>
        </div>
      </div>
    </section>
    <div class="container">
      <div class="columns is-gapless">
        <div class="column is-one-quarter">
          <div class="box activity-list">
            <ListItem
              v-for="(route, index) in routes.data"
              :id="route.id_str"
              :key="route.id_str"
              :item-details="route"
              :index="index"
              :selected="isSelected(route)"
              @select="selectRoute"
            >
              <RouteContent :route="route" />
            </ListItem>
            <infinite-loading
              spinner="spiral"
              @infinite="infiniteHandler"
            />
          </div>
        </div>
        <div class="column is-hidden-tablet">
          <nav class="level gripline">
            <div class="level-item has-text-centered">
              <span class="icon"><font-awesome-icon icon="grip-lines" /></span>
            </div>
          </nav>
        </div>
        <div class="column">
          <div class="box map">
            <TheMap :latlng="selectedLatlng" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import InfiniteLoading from 'vue-infinite-loading'

import {mutations, store} from "@/store"
import TheMap from '@/components/TheMap.vue'
import ListItem from '@/components/ListItem'
import RouteContent from "@/components/RouteContent"


export default {
  name: "Routes",
  components: {
    InfiniteLoading,
    FontAwesomeIcon,
    TheMap,
    ListItem,
    RouteContent
  },
  data: () => {
    return {
      routes: { data: [] },
      selectedRoute: { latlng: { data: null } },
      page: 1
    }
  },
  computed: {
    selectedLatlng() {
      return this.selectedRoute.latlng ? this.selectedRoute.latlng.data : null
    }
  },
  methods: {
    async getRouteDetails(id) {
      const headers = {
        Authorization: `Bearer ${store.token}`,
      }

      return axios.get(
        `https://www.strava.com/api/v3/routes/${id}/streams`,
        { headers }
      ).catch(error => {
        if (error.response.status === 401) {
          mutations.clearToken()
          this.$router.push('/login')
        }
      })
    },
    isSelected(route) {
      return route && this.selectedRoute && route.id_str === this.selectedRoute.id
    },
    infiniteHandler($state) {
      const headers = {
        Authorization: `Bearer ${store.token}`,
      }

      const params = {
        page: this.page,
        'per-page': 50,
      }

      axios
        .get('https://www.strava.com/api/v3/athlete/routes', { headers, params })
        .then((res) => {
          if (res.data.length) {
            this.page += 1
            this.routes.data.push(...res.data)
            if(!this.selectedRoute.id) {
              this.selectRoute(res.data[0].id_str)
            }
            $state.loaded()
          } else {
            $state.complete()
          }
        })
        .catch(error => {
          if (error.response.status === 401) {
            mutations.clearToken()
            this.$router.push('/login')
          }
        })
    },
    selectRoute(id) {
      this.selectedRoute.id = id

      this.getRouteDetails(id).then((result) => {
        this.selectedRoute = { latlng: { data: [...result.data[0].data] }, id }
      })

      document.getElementById('map').scrollIntoView()
    },
  }
}
</script>
