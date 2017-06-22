const path = require('path')

const ROOT_DIR = process.cwd()
const LOGS_DIR = path.resolve(ROOT_DIR, 'logs')
const USERS_PATH = path.resolve(ROOT_DIR, 'data', 'users.json')

module.exports = {
  ROOT_DIR,
  LOGS_DIR,
  USERS_PATH
}

