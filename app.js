const Koa = require('koa')
const koaRouter = require('koa-router')
const serve = require('koa-static')
const convert = require('koa-convert')
const body = require('koa-better-body')

const app = new Koa()
const router = koaRouter()

router.post('/hooks', async (ctx, next) => {
  console.log(ctx.request.headers['X-GitHub-Event'])
  console.log(ctx.request.fields)
  ctx.body = 'ok'
})

app.use(convert(body()))
app.use(serve('.'))
app.use(router.routes())

app.listen(3000, () => {
  console.log('listending on port 3000')
})