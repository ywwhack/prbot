<template>
  <div id="app">
    Welcome to prbot!
    <el-checkbox v-model="notify.state">开启 review 通知</el-checkbox>
    <el-time-select
      placeholder="开始时间"
      v-model="notify.time[0]"
      :picker-options="{
        start: '00:00',
        end: '24:00',
        step: '01:00'  
      }"
      :disabled="!notify.state">
    </el-time-select>
    <el-time-select
      placeholder="结束时间"
      v-model="notify.time[1]"
      :picker-options="{
        start: '00:00',
        end: '24:00',
        step: '01:00'  
      }"
      :disabled="!notify.state">
    </el-time-select>
    <el-button type="primary" @click="handleSubmit">更新</el-button>
  </div>
</template>

<script>
import axios from '@/utils/api'

export default {
  name: 'app',

  data () {
    return {
      notify: {
        state: true,
        time: []
      }
    }
  },

  methods: {
    handleSubmit () {
      axios.post('/setting/user/ywwhack', this.notify)
        .then(() => {
          this.$message({ message: '更新成功', type: 'success' })
        }, () => {
          this.$message({ message: '出错啦', type: 'error' })
        })
    }
  },

  created () {
    axios.get('/auth')
      .then(({ notify }) => {
        this.notify = notify
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
