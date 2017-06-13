const net = require('net')
const qrcode = require('qrcode-terminal')
const MessageQueue = require('./MessageQueue')

const Wechat = require('wechat4u')
const bot = new Wechat()
bot.start()

/**
 * 初始化消息队列
 */
const GROUP_NAME = '大数据小小小小小小分队'
const dtMsgQueue = new MessageQueue(bot, '文件传输助手')

/**
 * uuid事件，参数为uuid，根据uuid生成二维码
 */
bot.on('uuid', uuid => {
  qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
    small: true
  })
 
  console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
})

/**
 * 登录成功事件
 */
bot.on('login', () => {
  console.log('登录成功')
})

/**
 * 错误事件，参数一般为Error对象
 */
bot.on('error', err => {
  console.error('错误：', err.message)
})

// 接受到 pr 相关事件
const socket = net.createConnection({ port: 4000, host: '106.14.224.65' }, () => {
  console.log('connected to server!')
})
socket.setEncoding('utf8')

let prQueue = []
const PR_EVENT = 'pull_request'
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
  
  const receiveEvent = payload['x-github-event']
  // 只处理 pull_request，其余 hooks 直接返回
  if (receiveEvent === PR_EVENT) {
    if (payload.action === OPEN_PR_ACTION) {
      const prData = payload.pull_request
      dtMsgQueue.send(`${prData.head.repo.name}: ${prData.html_url}`)
    }
  }
})
