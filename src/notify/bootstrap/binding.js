const fs = require('fs')
const path = require('path')

const BINDING_FILE = path.resolve(process.cwd(), 'data', 'binding.json')

let binding = {}
if (!fs.existsSync(BINDING_FILE)) {
  // 如果 binding.json 文件不存在，先创建一个空的 binding.json 文件
  const fd = fs.openSync(BINDING_FILE, 'w')
  fs.writeSync(fd, JSON.stringify(binding))
} else {
  binding = JSON.parse(fs.readFileSync(BINDING_FILE, 'utf8'))
}

module.exports = {
  BINDING_FILE,
  binding
}
