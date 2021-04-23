<template>
  <div id="map" />
</template>

<script>
import 'leaflet/dist/leaflet.css'
import 'leaflet.fullscreen/Control.FullScreen.css'
import L from 'leaflet'
// eslint-disable-next-line no-unused-vars
import p4l from 'proj4leaflet' // required for L.Proj.CRS
// eslint-disable-next-line no-unused-vars
import leafletFullscreen from 'leaflet.fullscreen' // required for leaflet fullscreen control
import * as GeoSearch from 'leaflet-geosearch'
import proj4 from 'proj4'
import * as turf from '@turf/turf'
import 'leaflet-defaulticon-compatibility'

export default {
  props: {
    latlng: {
      type: Array,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      map: null,
      locationMarker: null,
      locationCircle: null
    }
  },
  watch: {
    latlng() {
      this.plotLatlng()
    },
  },
  mounted() {
    this.initialiseMap()
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
        minZoom: 6,
        maxZoom: 9,
        center: proj4('EPSG:27700', 'EPSG:4326', [337297, 503695]).reverse(),
        zoom: 7,
        attributionControl: false,
        fullscreenControl: true,
      }

      this.map = L.map('map', mapOptions)

      if (!this.latlng) {
        this.setupStartTiles()
      } else {
        this.plotLatlng()
      }

      const search = new GeoSearch.GeoSearchControl({
        style: 'button',
        position: 'topright',
        provider: new GeoSearch.OpenStreetMapProvider(),
      })

      this.map.addControl(search)

      this.map.locate({ maxZoom: 16, watch: true })

      this.map.on('locationfound', this.onLocationFound)
    },
    onLocationFound(e) {
      if (this.locationMarker) {
        this.locationMarker.remove()
      }
      if (this.locationCircle) {
        this.locationCircle.remove()
      }
      const radius = e.accuracy

      this.locationMarker = L.marker(e.latlng)
        .addTo(this.map)

      this.locationCircle = L.circle(e.latlng, radius).addTo(this.map)
    },
    setupStartTiles() {
      const startZoomBounds = L.latLngBounds(
        L.latLng(54.44259993088727, -2.9374139555606513),
        L.latLng(54.416359041392084, -2.9817969157636037)
      )
      window.map = this.map

      this.setupTiles(startZoomBounds)
    },
    setupTiles(zoomBounds) {
      this.map.eachLayer((layer) => this.map.removeLayer(layer))

      const tileOptions = {
        maxNativeZoom: 9,
        minNativeZoom: 8,
      }
      const mapsApiUrl = `/api/maps?y={y}&x={x}&z={z}`

      L.tileLayer(mapsApiUrl, tileOptions).addTo(this.map)

      this.map.fitBounds(zoomBounds)
    },
    plotLatlng() {
      if (this.latlng) {
        const data = turf.lineString(this.latlng)

        const zoomBounds = L.latLngBounds(this.latlng)

        this.setupTiles(zoomBounds)
        L.geoJSON(turf.flip(data), {
          style: () => {
            return {
              color: '#080357',
              opacity: 0.5,
              weight: 4,
            }
          },
        }).addTo(this.map)
      }
    },
  },
}
</script>

<style lang="scss">
#map {
  height: 100%;
  z-index: 0;
}
</style>
