const net = require('net')
const qrcode = require('qrcode-terminal')

const Wechat = require('wechat4u')
const bot = new Wechat()
bot.start()

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

/**
 * 联系人更新事件，参数为被更新的联系人列表
 */
let toUserName // 需要发的群名
const NICK_NAME = '大数据小小小小小小分队'
bot.on('contacts-updated', contacts => {
  const groupInfo = contacts.find(i => i.NickName === NICK_NAME)
  // 尝试先从 groupInfo 中取用户名，如果不存在用之前的 toUserName （因为可能会出现更新的列表里没有组，而之前的组名还可以用）
  toUserName = groupInfo && groupInfo.UserName || toUserName
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
      prQueue.push({ url: prData.html_url, name: prData.head.repo.name })
      if (toUserName) {
        // send this url to wechat
        prQueue.forEach(pr => {
          bot.sendMsg(`${pr.name}: ${pr.url}`, 'filehelper')
            .catch(err => {
              bot.emit('error', err)
            })
        })
        prQueue = []
      }
    }
  }
})
