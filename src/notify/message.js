const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const wechatBot = require('./bootstrap/wechatBot')
const { binding, BINDING_FILE } = require('./bootstrap/binding')

const DIRECTIVES = {
  addRepo: /\w*add_repo:(.+)/,
  bindUser: /\w*bind_user:(.+)/
}

wechatBot.on('message', async (msg) => {
  const { addRepo, bindUser } = DIRECTIVES
  // 只处理文本消息
  if (msg.MsgType === wechatBot.CONF.MSGTYPE_TEXT) {
    const Content = msg.Content
    let match
    if (match = addRepo.exec(Content)) {
      await handleAddRepo(match, msg)
    } else if (match = bindUser.exec(Content)) {
      await handleBindUser(match, msg)
    }
  }
})

async function handleAddRepo (match, msg) {
  const GroupUserName = msg.getPeerUserName()
  const repoName = match[1]
  try {
    const groups = await wechatBot.batchGetContact([{ UserName: GroupUserName }])
    const groupName = groups[0].NickName
    binding[repoName] = groupName
    await promisify(fs.writeFile)(BINDING_FILE, JSON.stringify(binding, null, '  '))
    await wechatBot.sendMsg(`${repoName} 已成功添加群通知`, GroupUserName)
  } catch (e) {
    // TODO: logger
    console.log('添加群通知出错')
  }
}

async function handleBindUser (match, msg) {
  const ToUserName = msg.getPeerUserName()
  const RemarkName = match[1]
  try {
    await wechatBot.updateRemarkName(ToUserName, RemarkName)
  } catch (e) {
    // TODO: logger
    console.log('修改备注失败')
  }
}
