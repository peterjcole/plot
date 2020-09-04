# plot
> View, and share, your Strava Activities on an [Ordnance Survey Explorer 1:25000 map](https://shop.ordnancesurvey.co.uk/mapsheetfinder.html#choosing) (UK only)

https://plot.fit

## Local setup
### Prerequisites
- [Node and npm](https://nodejs.org/en/)
- [Vercel CLI](https://vercel.com/download)
- A firebase project setup with Cloud Firestore and anonymous auth enabled
- OS Data Hub [OS Maps API](https://osdatahub.os.uk/docs/wmts/overview) project & API key
- [Strava API key](http://developers.strava.com/)

### Setup

Install dependencies:
```
npm install
```

Add required env vars to a `.env` file in the root of the project:
```env
OS_MAPS_API_KEY=""
VUE_APP_STRAVA_CLIENT_ID=""
STRAVA_CLIENT_SECRET=""
```

Edit firebase credentials to point to your firebase instance in [db.js](src/db.js)


### Compile and hot-reload for development
```
vercel dev
```

### Run unit tests
```
npm run test:unit
```

### Run end-to-end tests
```
npm run test:e2e
```

### Lint and fix files
```
npm run lint
```

## Build & deploy
- Fork the repo and deploy via [Vercel](https://www.vercel.com), setting environment variables as above.