const fetch = require('node-fetch')
module.exports = async (req, res) => {
  fetch(
    `https://heatmap-external-c.strava.com/tiles-auth/${req.query.activityType}/purple/${req.query.z}/${req.query.x}/${req.query.y}.png?v=19`,
    {
      headers: {
        cookie: req.headers['heatmap-cookie'],
      },
      body: null,
      method: 'GET',
    }
  ).then((response) => {
    if (response.ok) {
      response.body.pipe(res)
    } else {
      res.status(response.status).send(response.body)
    }
  })
}
