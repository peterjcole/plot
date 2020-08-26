const fetch = require('node-fetch')

const serviceUrl = 'https://osdatahubapi.os.uk/OSMapsAPI/wmts/v1'
const apiKey = process.env.OS_MAPS_API_KEY

module.exports = async (req, res) => {
  const params = {
    service: 'WMTS',
    request: 'GetTile',
    version: '2.0.0',
    height: 256,
    width: 256,
    outputFormat: 'image/png',
    style: 'default',
    layer: 'Leisure_27700',
    tileMatrixSet: 'EPSG:27700',
    tileMatrix: req.query.z,
    tileRow: req.query.y,
    tileCol: req.query.x,
  };

  const queryUrl = new URL(serviceUrl)
  queryUrl.searchParams.append('key', apiKey)
  Object.entries(params).forEach((pair) => queryUrl.searchParams.append(pair[0], pair[1]))

  fetch(queryUrl.toString()).then(tile => tile.body.pipe(res))

}
