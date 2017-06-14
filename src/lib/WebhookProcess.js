class WebhookProcess {
  constructor (wechatBot) {
    // 这里保存着每个 event 对应的处理函数
    // 如：pull_request : function process_pull_request
    this.eventMap = {}
    this.wechatBot = wechatBot
  }

  use (eventName, fn) {
    (this.eventMap[eventName] = this.eventMap[eventName] || []).push(fn)
  }

  process (payload) {
    const { wechatBot, eventMap } = this
    const eventName = payload['x-github-event']
    const fns = eventMap[eventName]
    if (fns) {
      fns.forEach(fn => {
        // 每个 fn 接受两个参数 (eventName, payload)
        fn(eventName, payload, wechatBot)
      })
    }
  }
}

module.exports = WebhookProcess
