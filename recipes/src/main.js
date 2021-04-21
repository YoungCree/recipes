import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'purecss/build/pure-min.css'
import 'purecss/build/grids-responsive-min.css'

Vue.config.productionTip = false

let data = {
  user: null
}

new Vue({
  data,
  router,
  render: h => h(App)
}).$mount('#app')
