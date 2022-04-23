<template>
  <div id="map" />
</template>

<script>
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import Group from 'ol/layer/Group'
import proj4 from 'proj4'
import TileGrid from 'ol/tilegrid/TileGrid'
import WMTS from 'ol/tilegrid/WMTS'
import { XYZ } from 'ol/source'
import { register } from 'ol/proj/proj4'
import Geocoder from 'ol-geocoder'
import 'ol-geocoder/dist/ol-geocoder.min.css'
import 'ol/ol.css'
import 'ol-layerswitcher/dist/ol-layerswitcher.css'
import LayerSwitcher from 'ol-layerswitcher'
import { Control, FullScreen } from 'ol/control'
import TileState from 'ol/TileState'

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
      locationCircle: null,
      locateLayer: null,
    }
  },
  watch: {
    latlng() {
      this.onLatlngChange()
    },
  },
  mounted() {
    this.initialiseMap()
  },
  methods: {
    initialiseMap() {
      class CookieControl extends Control {
        constructor(opt_options) {
          const options = opt_options || {}

          const button = document.createElement('button')
          button.innerHTML = '🍪'

          const element = document.createElement('div')
          element.className = 'cookie-control ol-unselectable ol-control'
          element.appendChild(button)

          super({
            element: element,
            target: options.target,
          })

          button.addEventListener('click', this.cookiePrompt, false)
        }

        cookiePrompt() {
          const cookie = window.prompt('Enter Strava cookie', localStorage.getItem('heatmapCookie') || '')
          localStorage.setItem('heatmapCookie', cookie)
        }
      }

      proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs')
      register(proj4)

      const osTileGrid = new TileGrid({
        resolutions: [896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75],
        origin: [-238375.0, 1376256.0],
        minZoom: 8,
      })

      const getStravaUrl = (activityType) => `https://heatmap-external-b.strava.com/tiles/${activityType}/bluered/{z}/{x}/{y}.png?v=19`

      let heatmapResolutions = [
        156543.033928041,
        78271.51696402048,
        39135.75848201023,
        19567.87924100512,
        9783.93962050256,
        4891.96981025128,
        2445.98490512564,
        1222.99245256282,
        611.49622628141,
        305.7481131407048,
        152.8740565703525,
        76.43702828517624,
        38.21851414258813,
        19.10925707129406,
        9.554628535647032,
        4.777314267823516,
        2.388657133911758,
        1.194328566955879,
        0.5971642834779395,
        0.29858214173896974,
        0.14929107086948487,
      ]

      const stravaLowResTileGrid = new WMTS({
        tileSize: 256,
        extent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
        resolutions: heatmapResolutions.slice(0, 12),
      })

      const stravaHighResTileGrid = new WMTS({
        tilePixelRatio: 2,
        extent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
        resolutions: heatmapResolutions,
      })

      const stravaHighResLoader = (tile, src) => {
        const client = new XMLHttpRequest()
        client.open('GET', src)
        client.responseType = 'blob'
        client.setRequestHeader('heatmap-cookie', localStorage.getItem('heatmapCookie'))
        client.addEventListener('loadend', function() {
          const data = this.response
          if (data !== undefined) {
            tile.getImage().src = URL.createObjectURL(data)
          } else {
            tile.setState(TileState.ERROR)
          }
        })
        client.send()
      }

      const getStravaLayer = (title, activityType, visible) => new TileLayer({
        title,
        visible,
        source: new XYZ({
          url: getStravaUrl(activityType),
          tileGrid: stravaLowResTileGrid,
        }),
      })

      const getStravaHighResLayer = (title, activityType, visible) => new TileLayer({
        title,
        visible,
        source: new XYZ({
          url: `/api/heatmap?y={y}&x={x}&z={z}&activityType=${activityType}`,
          tileGrid: stravaHighResTileGrid,
          tileLoadFunction: stravaHighResLoader,
        }),
        opacity: 0.75,
      })

      const stravaLayers = new Group({
        title: 'Strava heatmap (low res)',
        layers: [
          getStravaLayer('Run', 'run', false),
          getStravaLayer('Ride', 'ride', false),
          getStravaLayer('Winter', 'winter', false),
          getStravaLayer('Water', 'water', false),
          getStravaLayer('All', 'all', false),
        ],
      })

      const stravaHighResLayers = new Group({
        title: 'Strava heatmap (high res, requires cookie)',
        layers: [
          getStravaHighResLayer('Run', 'run', true),
          getStravaHighResLayer('Ride', 'ride', false),
          getStravaHighResLayer('Winter', 'winter', false),
          getStravaHighResLayer('Water', 'water', false),
          getStravaHighResLayer('All', 'all', false),
        ],
      })

      const osLayers = new Group({
        title: 'Base maps',
        layers: [
          new TileLayer({
            title: 'OS Explorer 1:25000',
            type: 'base',
            source: new XYZ({
              url: '/api/maps?y={y}&x={x}&z={z}',
              projection: 'EPSG:27700',
              tileGrid: osTileGrid,
              tilePixelRatio: 4,
              tileSize: 64,
              // tilePixelRatio: 2,
              // tileSize: 128,
              interpolate: false,
              // tileSize: 32,
              // zDirection: 1,
              // minZoom: 7.999,
              // maxZoom: 8,
            }),
            // minZoom: 8,
          }),
        ],
      })

      const geocoder = new Geocoder('nominatim', {
        provider: 'osm',
        placeholder: 'Search for an address',
        // targetType: 'text-input',
        limit: 5,
        keepOpen: true,
      })

      const layerSwitcher = new LayerSwitcher({
        reverse: true,
        groupSelectStyle: 'group',
      })

      this.map = new Map({
        target: 'map',
        layers: [
          osLayers,
          stravaLayers,
          stravaHighResLayers,
        ],
        view: new View({
          projection: 'EPSG:27700',
          extent: [-238375.0, 0.0, 900000.0, 1376256.0],
          resolutions: osTileGrid.getResolutions(),
          // minZoom: 0,
          // maxZoom: 9,
          center: [337297, 503695],
          // TODO: Put this back to 7
          zoom: 8,
          minZoom: 6,
          // maxZoom: 9,
          enableRotation: false,
        }),
      })


      this.map.addControl(geocoder)
      this.map.addControl(layerSwitcher)
      this.map.addControl(new FullScreen())
      this.map.addControl(new CookieControl())
    },
    setupStartTiles() {
      // const startZoomBounds = L.latLngBounds(
      //   L.latLng(54.44259993088727, -2.9374139555606513),
      //   L.latLng(54.416359041392084, -2.9817969157636037)
      // )
      // window.map = this.map
      //
      // this.setupTiles(startZoomBounds)
    },
    setupTiles() {
      // this.map.eachLayer((layer) => this.map.removeLayer(layer))
      //
      // const tileOptions = {
      //   maxNativeZoom: 9,
      //   minNativeZoom: 8,
      // }
      // const mapsApiUrl = `/api/maps?y={y}&x={x}&z={z}`
      //
      // L.tileLayer(mapsApiUrl, tileOptions).addTo(this.map)
      //
      // this.map.fitBounds(zoomBounds)
    },
    onLatlngChange() {
      // if (this.latlng) {
      //   this.locateLayer.remove()
      //   const data = turf.lineString(this.latlng)
      //
      //   const zoomBounds = L.latLngBounds(this.latlng)
      //
      //   this.setupTiles(zoomBounds)
      //   L.geoJSON(turf.flip(data), {
      //     style: () => {
      //       return {
      //         color: '#080357',
      //         opacity: 0.5,
      //         weight: 4,
      //       }
      //     },
      //   }).addTo(this.map)
      //   this.locateLayer.addTo(this.map)
      // }
    },
  },
}
</script>

<style lang='scss'>
#map {
  height: 100%;
  z-index: 0;
}

.cookie-control {
  left: 0.5em;
  top: 6.2em;
  font-size: 1rem;
  padding: 2px;
}
</style>
