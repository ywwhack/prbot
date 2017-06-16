/**
 * 消息队列，用于发送给特定联系人或群消息
 */
const MessageQueue = require('../lib/MessageQueue')
const wechatBot = require('./wechatBot')

const filehelperMsgQueue = new MessageQueue(wechatBot, '文件传输助手')
const dtMsgQueue = new MessageQueue(wechatBot, '大数据小小小小小小分队')
// 创建 github 用户名与消息队列的映射关系
const userMsgQueueMap = ['ywwhack', 'coolzjy', 'xiguaxigua', 'Leopoldthecoder'].reduce((result, remarkName) => {
  result[remarkName] = new MessageQueue(wechatBot, remarkName, true)
  return result
}, {})

module.exports = {
  filehelperMsgQueue,
  dtMsgQueue,
  userMsgQueueMap
}