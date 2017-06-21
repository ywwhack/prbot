const Koa = require('koa')
const koaRouter = require('koa-router')
const convert = require('koa-convert')
const body = require('koa-better-body')
const path = require('path')
const fs = require('fs')
const cors = require('koa-cors')
const fetch = require('node-fetch')

const app = new Koa()
const router = koaRouter()
const PORT = 8000

const OAUTH_PATH = path.resolve(process.cwd(), 'oAuth.config.js')
let oAuthConfig = {}
if (!fs.existsSync(OAUTH_PATH)) {
  console.log('请提供 oAuth 的信息！')
  process.exit(0)
} else {
  oAuthConfig = require(OAUTH_PATH)
}

const USERS_PATH = path.resolve(process.cwd(), 'data', 'users.json')
if (!fs.existsSync(USERS_PATH)) {
  const fd = fs.openSync(USERS_PATH, 'w')
  fs.writeSync(fd, '{}')
}

router.get('/auth', async (ctx, next) => {
  const githubSession = ctx.cookies.get('github_session')
  if (githubSession) {
    ctx.body = 'auth success'
  } else {
    // redirect to get github_session
    ctx.redirect(`http://github.com/login/oauth/authorize?client_id=${oAuthConfig.client_id}`)
  }
})

router.get('/code', async (ctx, next) => {
  const code = this.request.query.code
  const { client_id, client_secret } = oAuthConfig
  console.log(code)
  const data = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    body: { client_id, client_secret, code } 
  })
    .then(res => res.json())
  console.log(data)
  ctx.cookies.set('github_session', data.github_session)
  ctx.body = 'access session success'
})

app.use(convert(cors({
  credentials: true
})))
app.use(convert(body()))
app.use(router.routes())

app.listen(PORT, () => {
  console.log(`setting server is listening on port: ${PORT}`)
})
