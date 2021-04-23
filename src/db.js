import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAXQYXWq_4KpYBVD-6hC6crAfR2fZ3WYtA",
  authDomain: "plot-df734.firebaseapp.com",
  databaseURL: "https://plot-df734.firebaseio.com",
  projectId: "plot-df734",
  storageBucket: "plot-df734.appspot.com",
  messagingSenderId: "462407248528",
  appId: "1:462407248528:web:8ae86ddbac13d6ffe34615",
  measurementId: "G-0P6ERYEYTH"
}


// Get a Firestore instance
export const db = firebase
  .initializeApp(firebaseConfig)
  .firestore()

export const dbAuth = firebase.auth()

// Export types that exists in Firestore
// This is not always necessary, but it's used in other examples
const { Timestamp, GeoPoint } = firebase.firestore
export { Timestamp, GeoPoint }
