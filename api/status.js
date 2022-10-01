const fetch = require('node-fetch')
module.exports = async (req, res) => {
  fetch(`https://heatmap-external-c.strava.com/tiles-auth/all/hot/7/64/43.png?v=19`, {
    headers: {
      cookie: req.headers['heatmap-cookie'],
    },
    body: null,
    method: 'GET',
  }).then((response) => {
    res.status(response.status).send()
  })
}
