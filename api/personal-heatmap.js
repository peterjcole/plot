const fetch = require('node-fetch')
module.exports = async (req, res) => {
  const url = `https://personal-heatmaps-external.strava.com/tiles/${req.headers['user-id']}/hot/${req.query.z}/${req.query.x}/${req.query.y}.png?filter_type=${req.query.activityType}&include_everyone=true&include_followers_only=true&include_only_me=true&respect_privacy_zones=false&include_commutes=true`;
  console.log(url)
  fetch(
    url,
    {
      headers: {
        cookie: req.headers['session-cookie'],
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
