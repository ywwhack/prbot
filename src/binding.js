const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const wechatBot = require('./bootstrap/wechatBot')

const BINDING_FILE = path.resolve(__dirname, 'binding.json')
// 如果 binding.json 文件不存在，先创建一个空的 binding.json 文件
if (!fs.existsSync(BINDING_FILE)) {
  fs.writeFileSync(BINDING_FILE, '{}')
}

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
    const json = JSON.parse(await promisify(fs.readFile)(BINDING_FILE, 'utf8'))
    json[repoName] = groupName
    await promisify(fs.writeFile)(BINDING_FILE, JSON.stringify(json, null, '  '))
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
