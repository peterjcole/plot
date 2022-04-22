const fetch = require('node-fetch')

const key = process.env.OS_MAPS_API_KEY

module.exports = async (req, res) => {
  const url = `https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/${req.query.z}/${req.query.x}/${req.query.y}.png?key=${key}`
  fetch(url).then((response) => {
    if (response.ok) {
      response.body.pipe(res)
    } else {
      res.status(response.status).send(response.body)
    }
  })
}
