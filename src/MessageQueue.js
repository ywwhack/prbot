class MessageQueue {
  constructor (wechatBot, nameToSearch, useRemarkName = false) {
    this.wechatBot = wechatBot
    this.UserName = null
    this.messages = []

    wechatBot.on('contacts-updated', contacts => {
      const groupInfo = contacts.find(i => i[useRemarkName ? 'RemarkName' : 'NickName'] === nameToSearch)
      // 尝试先从 groupInfo 中取用户名，如果不存在用之前的 UserName （因为可能会出现更新的列表里没有组，而之前的组名还可以用）
      this.UserName = groupInfo && groupInfo.UserName || this.UserName
    })
  }

  send (message) {
    const { messages, UserName, wechatBot } = this
    messages.push(message)
    if (UserName) {
      messages.forEach(message => {
        wechatBot.sendMsg(message, UserName)
      })
      this.messages = []
    }
  }
}

module.exports = MessageQueue
