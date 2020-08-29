<template>
  <div id="map" />
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// eslint-disable-next-line no-unused-vars
import p4l from 'proj4leaflet' // required for L.Proj.CRS
import proj4 from 'proj4'
import * as turf from '@turf/turf'

export default {
  data() {
    return {
      map: null,
    }
  },
  props: {
    activity: Object,
  },
  mounted() {
    this.initialiseMap()
  },
  watch: {
    activity() {
      this.plotActivity()
    },
  },
  methods: {
    initialiseMap() {
      const crs = new L.Proj.CRS(
        'EPSG:27700',
        '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs',
        {
          resolutions: [896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75],
          origin: [-238375.0, 1376256.0],
        }
      )

      const mapOptions = {
        crs: crs,
        minZoom: 7,
        maxZoom: 9,
        center: proj4('EPSG:27700', 'EPSG:4326', [337297, 503695]).reverse(),
        zoom: 7,
        attributionControl: false,
      }

      this.map = L.map('map', mapOptions)

      const startBounds = L.latLngBounds(
        L.latLng(54.75474418589996, -2.557133753083287),
        L.latLng(54.0934435371236, -3.3719427214496935)
      )

      this.setupTiles(startBounds, startBounds)
      this.plotActivity()
    },
    setupTiles(tileBounds, zoomBounds) {
      this.map.eachLayer((layer) => this.map.removeLayer(layer))

      const tileOptions = {
        maxNativeZoom: 9,
        minNativeZoom: 8,
        tileBounds,
      }
      const mapsApiUrl = `/api/maps?y={y}&x={x}&z={z}`

      L.tileLayer(mapsApiUrl, tileOptions).addTo(this.map)

      this.map.fitBounds(zoomBounds)


    },
    plotActivity() {
      if (this.activity && this.activity.latlng && this.activity.latlng.data.length > 0) {
        const data = turf.lineString(this.activity.latlng.data)
        const bbox = turf.bbox(turf.transformScale(data, 10))

        const zoomBounds = L.latLngBounds(this.activity.latlng.data)
        const tileBounds = L.latLngBounds(L.latLng(bbox[2], bbox[3]), L.latLng(bbox[0], bbox[1]))

        this.setupTiles(zoomBounds, tileBounds)
        L.geoJSON(turf.flip(data)).addTo(this.map)
      }
    }
  },
}
</script>

<style lang="scss" scoped>
#map {
  height: 100%;
  z-index: 0;
}
</style>
