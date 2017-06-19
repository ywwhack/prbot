const net = require('net')
const Koa = require('koa')
const koaRouter = require('koa-router')
const convert = require('koa-convert')
const body = require('koa-better-body')
const { Logger, transports } = require('winston')
const fs = require('fs')
const path = require('path')
const moment = require('moment')

/**
 * logger
 */
const LOGS_DIR = path.resolve(__dirname, '..', 'logs')
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR)
}

function dateFormatter () {
  return moment().format('MM/DD h:mm:ss')
}

const logger = new Logger({
  transports: [
    new transports.File({
      timestamp: dateFormatter,
      name: 'file.info',
      filename: path.resolve(LOGS_DIR, 'info'),
      level: 'info'
    }),
    new transports.File({
      timestamp: dateFormatter,
      name: 'file.error',
      filename: path.resolve(LOGS_DIR, 'error'),
      level: 'error',
      handleExceptions: true
    })
  ],
  exitOnError: false
})

/**
 * tcp 长连接，用于转发 pr 请求
 */
const server= net.createServer()
let sockets = []

server.on('connection', socket => {
  sockets.push(socket)
  socket.on('close', hadError => {
    sockets = sockets.filter(s => s !== socket)
    if (hadError) logger.error('socket close error!')
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

router.post('/hooks', async (ctx, next) => {
  const event = ctx.request.headers['x-github-event']
  const payload = Object.assign({ 'x-github-event': event }, ctx.request.fields)
  const { sender, repository } = payload
  const message = `${sender.login} has ${event} on ${repository.name}`
  logger.info(message)
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
  ctx.body = message
})

app.use(convert(body()))
app.use(router.routes())

app.listen(3000, () => {
  console.log('pr server is listening on port 3000')
})
