const net = require('net')
const Koa = require('koa')
const koaRouter = require('koa-router')
const convert = require('koa-convert')
const body = require('koa-better-body')
const { Logger, transports } = require('winston')

/**
 * logger
 */
const logger = new Logger({
  transports: [
    new transports.Console({
      handleExceptions: true,
      level: 'error'
    }),
    new transports.File({
      filename: 'info.log',
      level: 'info'
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
  logger.info(`${event}, sender: ${payload.sender.login}`)
  sockets.forEach(socket => {
    socket.write(JSON.stringify(payload))
    socket.write(END_SYMBOL)
  })
  ctx.body = 'ok'
})

app.use(convert(body()))
app.use(router.routes())

app.listen(3000, () => {
  console.log('pr server is listening on port 3000')
})