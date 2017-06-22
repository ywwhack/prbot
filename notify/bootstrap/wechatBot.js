const Wechat = require('wechat4u')
const path = require('path')
const fs = require('fs')
const { createIfNotExist } = require('../../share/utils')

const SYNC_DATA = path.resolve(process.cwd(), 'data', 'sync-data.json')

let wechatBot
try {
  wechatBot = new Wechat(require(SYNC_DATA))
} catch (e) {
  wechatBot = new Wechat()
}

/**
 * 启动机器人
 */
if (wechatBot.PROP.uin) {
  // 存在登录数据时，可以随时调用restart进行重启
  wechatBot.restart()
} else {
  wechatBot.start()
}

/**
 * 登录成功事件
 */
wechatBot.on('login', () => {
  console.log('登录成功')
  // 保存数据，将数据序列化之后保存到指定位置
  createIfNotExist(SYNC_DATA, wechatBot.botData)
})

/**
 * 登出成功事件
 */
wechatBot.on('logout', () => {
  console.log('登出成功')
  // 清除数据
  fs.unlinkSync(SYNC_DATA)
})

module.exports = wechatBot
