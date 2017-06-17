const wechatBot = require('../bootstrap/wechatBot')

const messagesMap = {} // 每个用户名对应一个消息队列，用于控制消息的发送

wechatBot.on('contacts-updated', () => {
  Object.keys(messagesMap).forEach(to => {
    _send(to)
  })
})

const MessageQueue = {
  send (message, to) {
    // 将该消息加入到对应的消息队列中
    messagesMap[to] = messagesMap[to] || []
    messagesMap[to].push(message)

    _send(to)
  }
}

function _send (to) {
  const contact = Object.values(wechatBot.contacts).find(i => i.NickName === to || i.RemarkName === to)
  if (contact) {
    messagesMap[to].forEach(message => {
      wechatBot.sendMsg(message, contact.UserName)
    })
    delete messagesMap[to]
  }
}

module.exports = MessageQueue
