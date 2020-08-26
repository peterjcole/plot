import Vue from 'vue'

export const store = Vue.observable({
  token: '',
  tokenExpiry: '',
})

export const mutations = {
  setToken(token, tokenExpiry) {
    store.token = token
    store.tokenExpiry = tokenExpiry
    window.localStorage.setItem('token', token)
    window.localStorage.setItem('tokenExpiry', tokenExpiry)

  },
  retrieveTokenFromLocalStorage() {
    if (!store.token || !store.tokenExpiry) {
      this.setToken(window.localStorage.getItem('token'), window.localStorage.getItem('tokenExpiry'))
    }
  },
  clearToken() {
    store.token = ''
    store.tokenExpiry = ''
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('tokenExpiry')
  },
}
