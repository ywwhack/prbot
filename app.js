const Koa = require('koa')
const koaRouter = require('koa-router')
const serve = require('koa-static')
const convert = require('koa-convert')
const body = require('koa-better-body')

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