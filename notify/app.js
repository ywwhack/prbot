/**
 * 连接数据库
 */
require('../share/setup_mongoose')

/**
 * 如果 /data 文件夹不存在就创建一个
 */
const fs = require('fs')
const path = require('path')
const { createIfNotExist } = require('../share/utils')
const DATA_DIR = path.resolve(process.cwd(), 'data')
createIfNotExist(DATA_DIR)

/**
 * logger
 */
const { transports } = require('winston')
const { initLogger, dateFormatter } = require('./logger')
const { LOGS_DIR } = require('../share/paths')
const logger = initLogger('app')
logger.add(transports.File, {
  timestamp: dateFormatter,
  name: 'file.warn',
  filename: path.resolve(LOGS_DIR, 'app-warn.log'),
  level: 'warn',
})

/**
 * 初始化 wechat-bot 以及消息队列
 */
const wechatBot = require('./bootstrap/wechatBot')
require('./message')

const net = require('net')
const qrcode = require('qrcode-terminal')
const WebhookProcess = require('./lib/WebhookProcess')
const hookMiddlewares = require('./hookMiddlewares')

/**
 * 初始化 webhook 处理器，并加载相关处理函数
 */
const webhookProcess = new WebhookProcess(wechatBot)
hookMiddlewares.forEach(middleware => {
	webhookProcess.use(...middleware)
})

/**
 * uuid事件，参数为uuid，根据uuid生成二维码
 */
wechatBot.on('uuid', uuid => {
  qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
    small: true
  })
 
  console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
})

/**
 * 错误事件，参数一般为Error对象
 */
wechatBot.on('error', err => {
  logger.warn('错误：', err.message)
})

// 接受到 pr 相关事件
function initSocket () {
  const socket = net.createConnection({ port: 4000, host: '106.14.224.65' }, () => {
    console.log('connected to server!')

    // issue -> read ECONNRESET
    // TODO: 隔断时间检查连接是否还存在，不存在重新创建一个
    setInterval(() => {
      if (socket.destroyed) {
        console.log('reconnect to server ...')
        initSocket()
      }
    }, 5000)
  })
  socket.setEncoding('utf8')

  const PR_EVENT = 'pull_request'
  const PR_REVIEW_EVENT = 'pull_request_review'
  const OPEN_PR_ACTION = 'opened'
  const END_SYMBOL = '$$$$'

  let chunks = ''
  socket.on('data', data => {
    chunks += data
    let index = chunks.indexOf(END_SYMBOL)
    if (index === -1) return

    let payloadStr = chunks.slice(0, index)
    let payload
    try {
      payload = JSON.parse(payloadStr)
      chunks = chunks.slice(index + END_SYMBOL.length)
    } catch (e) {
      logger.warn('payload parse error!')
      return
    }
    
    webhookProcess.process(payload)
  })

  socket.on('error', error => {
    logger.error(error.message)
    socket.destroy()
  })

  socket.on('end', () => {
    console.log('reconnect to server ...')
    // 如果错误导致 socket 关闭，重新建立一个新连接
    initSocket()
  })
}

initSocket()
