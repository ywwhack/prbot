const Koa = require('koa')
const koaRouter = require('koa-router')
const convert = require('koa-convert')
const body = require('koa-better-body')
const path = require('path')
const fs = require('fs')
const cors = require('koa-cors')
const fetch = require('node-fetch')
const { promisify } = require('util')
const { createIfNotExist } = require('../../share/utils')

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
createIfNotExist(USERS_PATH, {})
const usersModel = require(USERS_PATH)

router.get('/code', async (ctx, next) => {
  const code = ctx.request.query.code
  const { client_id, client_secret } = oAuthConfig
  // 获取 github_token
  const { access_token } = await fetch(`https://github.com/login/oauth/access_token?client_id=${client_id}&&client_secret=${client_secret}&&code=${code}`, {
    method: 'POST',
    headers: { accept: 'application/json' }
  })
    .then(res => res.json())
  ctx.cookies.set('github_token', access_token)

  // 获取 githun 用户信息
  const { id, login } = await fetch(`https://api.github.com/user?access_token=${access_token}`).then(res => res.json())
  usersModel[login] = { id, access_token }
  await promisify(fs.writeFile)(USERS_PATH, JSON.stringify(usersModel, null, '  '))
  
  // TODO: 重定向到原来的地址
  ctx.redirect('http://localhost:8080')
})

router.get('/auth', async (ctx, next) => {
  const githubSession = ctx.cookies.get('github_token')
  if (githubSession) {
    ctx.body = githubSession
  } else {
    // redirect to get github_session
    ctx.status = 401
  }
})

app.use(convert(cors({
  credentials: true
})))
app.use(convert(body()))
app.use(router.routes())

app.listen(PORT, () => {
  console.log(`setting server is listening on port: ${PORT}`)
})
