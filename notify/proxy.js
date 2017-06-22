const net = require('net')
const Koa = require('koa')
const koaRouter = require('koa-router')
const convert = require('koa-convert')
const body = require('koa-better-body')
const { initLogger } = require('./logger')
const { createIfNotExist } = require('../share/utils')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')

/**
 * logger
 */
const logger = initLogger('proxy')

/**
 * repos.json
 */
const REPOS_PATH = path.resolve(process.cwd(), 'data', 'repos.json')
createIfNotExist(REPOS_PATH, [])
const repos = require(REPOS_PATH)

/**
 * tcp 长连接，用于转发 pr 请求
 */
const server= net.createServer()
let sockets = []

server.on('connection', socket => {
  sockets.push(socket)

  socket.on('error', error => {
    logger.error(error.message)
    socket.destroy()
  })

  socket.on('close', () => {
    sockets = sockets.filter(s => s !== socket)
  })
})

server.on('error', error => {
  logger.error(error.message)
})

server.listen(4000, () => {
  console.log('tcp server is listening on port 4000')
})

// pr 代理服务器
const app = new Koa()
const router = koaRouter()
const END_SYMBOL = '$$$$'

function notify (payload) {
  let socket = sockets[0]
  let i = 0
  while (socket) {
    // 如果连接已关闭，删除 sockets 数组中对应的项
    if (socket.destroyed) {
      sockets.splice(i, 1)
    } else {
      socket.write(JSON.stringify(payload))
      socket.write(END_SYMBOL)
      i++
    }
    socket = sockets[i]
  }
}

async function saveRepo (payload) {
  const { full_name, name } = payload.repository
  if (repos.findIndex(repo => repo.full_name === full_name) === -1) {
    repos.push({ full_name, name })
    await promisify(fs.writeFile)(REPOS_PATH, JSON.stringify(repos, null, '  '))
  }
}

router.post('/hooks', async (ctx, next) => {
  const event = ctx.request.headers['x-github-event']
  const payload = Object.assign({ 'x-github-event': event }, ctx.request.fields)
  const { sender, repository } = payload
  const message = `${sender.login} has ${event} on ${repository.name}`
  logger.info(message)
  if (event === 'ping') {
    await saveRepo(payload)
  } else {
    notify(payload)
  }
  ctx.body = message
})

app.use(convert(body()))
app.use(router.routes())

app.listen(3000, () => {
  console.log('pr server is listening on port 3000')
})
