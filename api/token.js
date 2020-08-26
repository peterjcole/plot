const fetch = require('node-fetch')
const { Headers } = require('node-fetch')

const tokenUrl = 'https://www.strava.com/api/v3/oauth/token'
const clientId = process.env.VUE_APP_STRAVA_CLIENT_ID
const clientSecret = process.env.STRAVA_CLIENT_SECRET

module.exports = async (req, res) => {
  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')

  const urlencoded = new URLSearchParams()
  urlencoded.append('client_id', clientId)
  urlencoded.append('client_secret', clientSecret)
  urlencoded.append('code', req.body.code)
  urlencoded.append('grant_type', 'authorization_code')

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow',
  }
  console.log(requestOptions)
  const response = await fetch(tokenUrl, requestOptions)
  console.log(response)
  const json = await response.json()
  res.status(response.status).json(json)
}
