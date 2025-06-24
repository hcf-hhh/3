import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VeLine from 'v-charts/lib/line'

Vue.use(ElementUI)

Vue.config.productionTip = false
const baseURL = 'http://localhost:10000'
const ajax = axios.create({
  baseURL
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
