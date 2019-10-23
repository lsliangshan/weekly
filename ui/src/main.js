import Vue from 'vue'
import App from './App.vue'
import { getHeader, getQuery } from './utils'
import { sync } from 'vuex-router-sync'
import router from './router'
import store from './store'
import mixins from './mixins'
// import io from 'socket.io-client'
import VueSocketIO from 'vue-socket.io'
import * as filters from './filters'
import './themes/styles/index.less'
import { Notice, Message } from 'view-design'

Vue.prototype.$Notice = Notice
Vue.prototype.$Message = Message

sync(store, router);
Vue.mixin(mixins);
(async () => {
  // let ServerEnv = 1
  let port = ''
  try {
    port = await getHeader('Wsp')
  } catch (err) {

  }
  port = port || getQuery('ws') || 8200
  // console.log('.... connect port 66666: ', port)
  // let news = io.connect(`http://127.0.0.1:${port}/${port}`)
  // news.on('hi', (data) => {
  //   console.log('from server 3: ', data)
  //   alert('from server 3: ' + data)
  // })
  // news.on('disconnect', () => {
  // })
  Vue.use(new VueSocketIO({
    debug: false,
    connection: `http://127.0.0.1:${port}/${port}`,
    vuex: {
      store,
      // actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_'
    }
  }))
})()

Vue.config.productionTip = false

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
