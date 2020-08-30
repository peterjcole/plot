import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { faMap, faRunning, faBiking, faShareAlt, faLink, faGripLines } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faStrava } from '@fortawesome/free-brands-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import VueTimeago from 'vue-timeago'
import Clipboard from 'v-clipboard'


library.add(faMap, faRunning, faBiking, faShareAlt, faLink, faGithub, faStrava, faGripLines)

Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')

Vue.use(VueTimeago, {
  name: 'Timeago', // Component name, `Timeago` by default
  locale: 'en', // Default locale
  // We use `date-fns` under the hood
  // So you can use all locales from it
  locales: {
    'zh-CN': require('date-fns/locale/zh_cn'),
    ja: require('date-fns/locale/ja')
  }
})

Vue.use(Clipboard)

Vue.directive('focus', {
  // When the bound element is inserted into the DOM...
  inserted: function (el) {
    // Focus the element
    el.focus()
  }
})


