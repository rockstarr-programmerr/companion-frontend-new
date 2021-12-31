import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import GAuth from 'vue-google-oauth2'
// @ts-expect-error google-oauth2 not support typescript
import { gauthOption } from './plugins/google-oauth2'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')

Vue.use(GAuth, gauthOption)
