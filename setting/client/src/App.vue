<template>
  <div id="app">
    Welcome to prbot!
  </div>
</template>

<script>
import axios from '@/utils/api'

export default {
  name: 'app',

  created () {
    axios.get('/auth')
      .then(data => {
        console.log(data)
      })
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
