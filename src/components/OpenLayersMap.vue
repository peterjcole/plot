<template>
  <div class="container map-container">
    <div class="level mb-3">
      <div class="level-left mb-0">
        <div class="field mb-0 mr-3 pl-1 switch-field">
          <input
            id="add-switch"
            v-model="drawMode"
            type="checkbox"
            name="add-switch"
            class="switch is-rtl is-small"
          >
          <label
            for="add-switch"
            class="pt-0"
          >Add points mode</label>
        </div>
        <button
          class="button mr-2 is-small"
          @click="undo"
        >
          Undo
        </button>
        <button
          class="button mr-2 is-small"
          @click="handleExportGpxClick"
        >
          Export GPX
        </button>
        <button
          class="button is-small is-danger is-light"
          @click="clearRoute"
        >
          <span class="icon">
            <i class="fas fa-trash" />
          </span>
          <span>Clear route</span>
        </button>
      </div>
      <div class="level-right mb-0">
        <button
          class="button is-small"
          @click="cookiePrompt"
        >
          Enter Strava cookie
        </button>
      </div>
    </div>
    <div
      class="level mb-3"
    >
      <span class="icon-text tag is-light">
        <span class="icon">
          <i class="fas fa-location-arrow" />
        </span>
        <span>Route distance: {{ formattedLength }}</span>
      </span>
    </div>
    <div id="map" />
  </div>
</template>

<script>
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import Group from 'ol/layer/Group'
import proj4 from 'proj4'
import TileGrid from 'ol/tilegrid/TileGrid'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { XYZ } from 'ol/source'
import { register } from 'ol/proj/proj4'
import Geolocation from 'ol/Geolocation'
import { createEmpty } from 'ol/extent'
import Geocoder from 'ol-geocoder'
import 'ol-geocoder/dist/ol-geocoder.min.css'
import 'ol/ol.css'
import 'ol-layerswitcher/dist/ol-layerswitcher.css'
import LayerSwitcher from 'ol-layerswitcher'
import { FullScreen, ZoomToExtent } from 'ol/control'
import TileState from 'ol/TileState'
import { Draw, Modify, Snap } from 'ol/interaction'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { Fill, Stroke, Style } from 'ol/style'
import { GPX } from 'ol/format'
import { getLength } from 'ol/sphere'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { throttle } from 'lodash/function'
import CircleStyle from 'ol/style/Circle'

const strokeStyleOptions = {
  color: 'hsla(18, 98%, 50%, 0.8)',
  width: 3,
  opacity: 0.8
}

const circleStrokeOptions = { color: '#BDD1DB', width: 2 }

const circleStyleOptions = {
  radius: 6,
  fill: new Fill({ color: '#4E8098' }),
  stroke: new Stroke(circleStrokeOptions),
}

const lineStyle = new Style({
  stroke: new Stroke(strokeStyleOptions),
  image: new CircleStyle(circleStyleOptions),
})


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
      draw: null,
      drawMode: false,
      drawSource: null,
      drawLength: null,
      verticesSource: null,
      exportingGpx: false,
    }
  },
  computed: {
    formattedLength() {
      if (this.drawLength > 100) {
        return Math.round((this.drawLength / 1000) * 100) / 100 + ' ' + 'km'
      } else {
        return Math.round(this.drawLength * 100) / 100 + ' ' + 'm'
      }
    },
  },
  watch: {
    latlng() {
      this.onLatlngChange()
    },
    drawMode(newDrawMode) {
      if (newDrawMode) {
        this.startDraw()
      } else {
        this.finishDrawing()
      }
    },
  },
  mounted() {
    this.initialiseMap()
  },
  methods: {
    initialiseMap() {
      proj4.defs(
        'EPSG:27700',
        '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
      )
      register(proj4)

      const osTileGrid = new TileGrid({
        resolutions: [896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75],
        origin: [-238375.0, 1376256.0],
        minZoom: 8,
      })

      const getStravaUrl = (activityType) =>
        `https://heatmap-external-b.strava.com/tiles/${activityType}/purple/{z}/{x}/{y}.png?v=19`

      const heatmapResolutions = [
        156543.033928041, 78271.51696402048, 39135.75848201023, 19567.87924100512, 9783.93962050256,
        4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.7481131407048,
        152.8740565703525, 76.43702828517624, 38.21851414258813, 19.10925707129406,
        9.554628535647032, 4.777314267823516, 2.388657133911758, 1.194328566955879,
        0.5971642834779395, 0.29858214173896974, 0.14929107086948487,
      ]

      const stravaLowResTileGrid = new WMTSTileGrid({
        // tileSize: 256,
        extent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
        resolutions: heatmapResolutions.slice(0, 12),
      })

      const stravaHighResTileGrid = new WMTSTileGrid({
        // tileSize: 256,
        // tileSizes: [512, 512],
        // tilePixelRatio: 2,
        extent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
        // resolutions: heatmapResolutions,
        resolutions: heatmapResolutions.slice(0, 16),
        // tileSize: 512,
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

      const getStravaLayer = (title, activityType, visible) =>
        new TileLayer({
          title,
          visible,
          source: new XYZ({
            url: getStravaUrl(activityType),
            tileGrid: stravaLowResTileGrid,
          }),
        })

      const getStravaHighResLayer = (title, activityType, visible) =>
        new TileLayer({
          title,
          visible,
          source: new XYZ({
            url: `/api/heatmap?y={y}&x={x}&z={z}&activityType=${activityType}`,
            tileGrid: stravaHighResTileGrid,
            tileLoadFunction: stravaHighResLoader,
            tilePixelRatio: 2,
            maxZoom: 15,
            // tileSize: 512,
          }),
          opacity: 0.75,
        })

      const stravaLayers = new Group({
        title: 'Strava heatmap (low res)',
        visible: false,
        layers: [
          getStravaLayer('Run', 'run', true),
          getStravaLayer('Ride', 'ride', false),
          getStravaLayer('Winter', 'winter', false),
          getStravaLayer('Water', 'water', false),
          getStravaLayer('All', 'all', false),
        ],
      })

      const stravaHighResLayers = new Group({
        title: 'Strava heatmap (high res, requires cookie)',
        layers: [
          getStravaHighResLayer('Run', 'run', false),
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

      this.drawSource = new VectorSource({ wrapX: true, format: new GPX() })

      this.drawSource.on('addfeature', () => {
        if (this.exportingGpx) {
          this.exportGpx()
        }

        this.updateVertices()
      })

      const drawLayer = new VectorLayer({
        source: this.drawSource,
        style: lineStyle,
      })

      this.verticesSource = new VectorSource({ wrapX: true })

      const verticesLayer = new VectorLayer({
        source: this.verticesSource,
        style: lineStyle,
      })


      const geocoder = new Geocoder('nominatim', {
        provider: 'osm',
        placeholder: 'Search for an address',
        // targetType: 'text-input',
        limit: 5,
        keepOpen: true,
      })

      const getCenter = () => {
        const lat = Number.parseFloat(localStorage.getItem('olLat'))
        const lng = Number.parseFloat(localStorage.getItem('olLng'))

        return lat && lng ? [lat, lng] : [337297, 503695]
      }

      this.map = new Map({
        target: 'map',
        layers: [osLayers, stravaLayers, stravaHighResLayers, drawLayer, verticesLayer],
        view: new View({
          projection: 'EPSG:27700',
          extent: [-238375.0, 0.0, 900000.0, 1376256.0],
          resolutions: osTileGrid.getResolutions(),
          // minZoom: 0,
          // maxZoom: 9,
          center: getCenter(),
          // center: [337297, 503695],
          // TODO: Put this back to 7
          zoom: 8,
          minZoom: 7,
          // maxZoom: 9,
          enableRotation: false,
        }),
      })

      const layerSwitcher = new LayerSwitcher({
        reverse: true,
        groupSelectStyle: 'none',
      })

      const geolocation = new Geolocation({
        projection: this.map.getView().getProjection(),
        tracking: true,
      })

      const extent = createEmpty()

      geolocation.on('change:accuracyGeometry', function() {
        geolocation.getAccuracyGeometry().getExtent(extent)
      })

      const zoomToExtentControl = new ZoomToExtent({
        extent: extent,
        className: 'geolocation-control',
        label: '🧭',
      })

      this.map.addControl(geocoder)
      this.map.addControl(layerSwitcher)
      this.map.addControl(new FullScreen())
      this.map.addControl(zoomToExtentControl)

      this.map.on('moveend', () => {
        const [lat, lng] = this.map.getView().getCenter()
        localStorage.setItem('olLat', lat)
        localStorage.setItem('olLng', lng)
      })
    },
    cookiePrompt() {
      const cookie = window.prompt(
        'Enter Strava cookie',
        localStorage.getItem('heatmapCookie') || '',
      )
      localStorage.setItem('heatmapCookie', cookie)
    },
    startDraw() {
      this.verticesSource.clear()

      this.draw = new Draw({
        source: this.drawSource,
        // finishCondition: () => false,
        type: 'LineString',
        style: new Style({
          stroke: new Stroke(strokeStyleOptions),
          image: new CircleStyle({
            ...circleStyleOptions,
            radius: 4,
            stroke: new Stroke({ ...circleStrokeOptions, width: 1 }),
          }),
        }),
      })

      const existingFeature = this.drawSource.getFeatures()[0]

      if (existingFeature) {
        this.draw.extend(existingFeature)
      }

      this.draw.on('drawstart', ({ feature }) => {
        feature.getGeometry().on('change', ({ target }) => {
          this.drawLength = getLength(target)
        })
      })

      this.draw.on('drawend', async () => {
        // Prevent double click zooming
        await new Promise(resolve => setTimeout(resolve, '10'))
        this.map.removeInteraction(this.draw)

        this.drawMode = false

      })

      this.map.addInteraction(this.draw)
      this.drawSource.clear()


      const modify = new Modify({
        source: this.drawSource, style: new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: '#FC4C02' }),
            stroke: new Stroke({ color: '#FEC6AE', width: 2 }),
          }),
        }),
      })

      modify.on('modifystart', () => {
        this.verticesSource.clear()
      })

      modify.on('modifyend', () => {
        this.updateVertices()
      })
      this.map.addInteraction(modify)

      const snap = new Snap({ source: this.drawSource })

      this.map.addInteraction(snap)
    },
    undo() {
      if (!this.drawMode) {
        this.drawMode = true
      }
      this.draw.removeLastPoint()
    },
    clearRoute() {
      if (this.draw) {
        this.finishDrawing()
      }

      this.drawSource.clear()
      this.verticesSource.clear()
      this.drawLength = 0
    },
    finishDrawing() {
      if(!this.drawLength) {
        this.map.removeInteraction(this.draw)
      } else {
        this.draw.finishDrawing()
      }
    },
    updateVertices: throttle(function() {
      console.log('throttled')
      this.verticesSource.clear()
      this.drawSource.getFeatures()[0].getGeometry().getCoordinates().forEach(coordinates => {
        this.verticesSource.addFeature(new Feature({
          geometry: new Point(coordinates),
        }))
      })
    }, 100, { leading: true }),
    handleExportGpxClick() {
      this.exportingGpx = true

      if (this.drawMode) {
        this.drawMode = false
      } else {
        this.exportGpx()
      }

    },
    exportGpx() {
      const features = this.drawSource.getFeatures()

      if (features?.length) {
        const gpx = new GPX()

        const gpxString = gpx.writeFeatures(this.drawSource.getFeatures(), {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:27700',
        })

        const pom = document.createElement('a')
        pom.setAttribute('href', 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(gpxString))
        pom.setAttribute('download', 'route.gpx')

        if (document.createEvent) {
          const event = document.createEvent('MouseEvents')
          event.initEvent('click', true, true)
          pom.dispatchEvent(event)
        } else {
          pom.click()
        }
      }

      this.exportingGpx = false
    },
  },
}
</script>

<style lang="scss">
@import '~bulma/bulma.sass';

.map-container {
  display: flex;
  flex-direction: column;
}

.container {
  height: 100%;
  width: 100%;
}

.level-right {
  @include until($tablet) {
    margin-top: 0.75rem !important;
  }
}

.switch-field {
  @include until($tablet) {
    margin-bottom: 0.75rem !important;
  }
}

#map {
  flex: 1;
  background-color: white;
  &, canvas, div {
    touch-action: manipulation;
  }
}

.ol-control {
  background-color: revert;
  padding: 0;
  margin: 0;

  button {
    background-color: white;
    color: black;
    outline: 1px solid #ccc;
    margin: 0;
    padding: 0;

    &:hover {
      background-color: darkgrey;
    }

    &:focus {
      background-color: lightgrey;
    }
  }
}

.geolocation-control {
  position: absolute;
  left: 0.5em;
  top: 7.1em;
  height: 1.375em;
  width: 1.375em;
  padding: 0;
  margin: 0;

  button {
    position: revert;
    padding: 0;
    margin: 0;
  }
}

.ol-geocoder {
  &.gcd-gl-container {
    left: 0.4em;
  }

  .gcd-gl-btn {
    left: 0.15em;
    background-image: revert;

    &:after {
      content: '🔎';
    }
  }

  .gcd-gl-reset::after {
    font-size: 1.4em;
  }

  ul.gcd-gl-result > li:nth-child(odd) {
    background-color: #eee;
  }
}


.layer-switcher {
  top: 2.3em;
  padding: 0;

  button {
    width: 1.375em;
    height: 1.375em;
    background-image: revert;

    &:after {
      content: '🗺'
    }
  }
}

.ol-touch .ol-full-screen {
  right: 1.15em;
}

.ol-touch .layer-switcher {
  top: 3.2em;
}

.ol-touch .geolocation-control {
  top: 8.5em;
}

.ol-full-screen {
  height: 1.375em;
  width: 1.375em;
  right: 0.5em;
  padding: 0;
  margin: 0;
}

</style>
