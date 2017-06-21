import axios from 'axios'

axios.defaults.baseURL = 'http://106.14.224.65:8000'
axios.defaults.withCredentials = true

axios.interceptors.response.use(response => {
  return response.data
}, error => {
  if (error.response.status === 401) {
    location.href = 'http://github.com/login/oauth/authorize?client_id=9da4b5036e03a173d970'
    return Promise.resolve('正在重定向')
  }
})

export default axios
