const Koa = require('koa')
const koaRouter = require('koa-router')
const serve = require('koa-static')
const convert = require('koa-convert')
const body = require('koa-better-body')
const qrcode = require('qrcode-terminal')

const Wechat = require('wechat4u')
let bot = new Wechat()
bot.start()

bot.on('uuid', uuid => {
  qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
    small: true
  })
  console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
})

bot.on('contacts-updated', contacts => {
  let ToUserName = contacts.find(i => i.NickName === '大数据小小小小小小分队').UserName
  
  /**
   * 发送文本消息，可以包含emoji(😒)和QQ表情([坏笑])
   */

  const app = new Koa()
  const router = koaRouter()

  const PR_EVENT = 'pull_request'
  const OPEN_PR_ACTION = 'opened'

  router.post('/hooks', async (ctx, next) => {
    const receiveEvent = ctx.request.headers['x-github-event']
    // 只处理 pull_request，其余 hooks 直接返回
    if (receiveEvent === PR_EVENT) {
      const payload = ctx.request.fields
      if (payload.action === OPEN_PR_ACTION) {
        const prUrl = payload.pull_request && payload.pull_request.html_url
        if (prUrl) {
          console.log(prUrl)
          // send this url to wechat
          bot.sendMsg(prUrl, 'filehelper')
            .catch(err => {
              bot.emit('error', err)
            })
        }
      }
    }
    ctx.body = 'ok'
  })

  app.use(convert(body()))
  app.use(serve('.'))
  app.use(router.routes())

  app.listen(3000, () => {
    console.log('listending on port 3000')
  })
})

bot.on('login', () => {
  let ToUserName = '@@335befc58673bdb22d4af4c565fde2c60beae11e29a8d3579990c5bb9f1fe758'

})
