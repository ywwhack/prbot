/**
 * 初始化 wechat-bot 以及消息队列
 */
const wechatBot = require('./bootstrap/wechatBot')
require('./bootstrap/messageQueues')
require('./message')

const net = require('net')
const qrcode = require('qrcode-terminal')
const WebhookProcess = require('./lib/WebhookProcess')
const processMiddleware = require('./processMiddleware')

/**
 * 初始化 webhook 处理器，并加载相关处理函数
 */
const webhookProcess = new WebhookProcess(wechatBot)
processMiddleware.forEach(middleware => {
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
  console.error('错误：', err.message)
})

// 接受到 pr 相关事件
const socket = net.createConnection({ port: 4000, host: '106.14.224.65' }, () => {
  console.log('connected to server!')
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
    console.log('payload parse error!')
    return
  }
  
	webhookProcess.process(payload)
})
