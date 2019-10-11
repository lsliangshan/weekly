<template>
  <div id="app">
    <router-view name="HomeRouter" />
  </div>
</template>

<script>
import * as types from './store/mutation-types'
export default {
  name: 'App',
  sockets: {
    disconnect () {
      this.$store.commit(types.CACHE_CONNECT_STATUS, {
        connectStatus: false
      })
    },
    reconnect () {
      this.$store.commit(types.CACHE_CONNECT_STATUS, {
        connectStatus: true
      })
    },
    hi (data) {
      console.log('.....', JSON.stringify(data, null, 2))
      this.$store.commit(types.CACHE_ENKEL_ENV, {
        enkelEnv: data
      })
      this.$store.commit(types.CACHE_CURRENT_PATH, {
        currentPath: data.PWD
      })
    }
  }
}
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
}
html,
body {
  height: 100%;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  height: 100%;
}
// #nav {
//   padding: 30px;
//   a {
//     font-weight: bold;
//     color: #2c3e50;
//     &.router-link-exact-active {
//       color: #42b983;
//     }
//   }
// }
</style>
