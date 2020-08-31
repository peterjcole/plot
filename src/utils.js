import { animals, adjectives } from "@/words"

export function latlngToObject(latlngArray) {
  return latlngArray.map((latlng) => {
    return {
      lat: latlng[0],
      lng: latlng[1],
    }
  })
}

export function latLngToArray(latLngObjectArray) {
  return latLngObjectArray.map((latlngObject) => [latlngObject.lat, latlngObject.lng])
}

export function adjectiveAnimal() {
  return `${capitalise(randomItemFrom(adjectives))}${capitalise(randomItemFrom(animals))}`
}

function capitalise(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function randomItemFrom(array) {
  return array[Math.floor(Math.random() * array.length)]
}
