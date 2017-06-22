const path = require('path')
const fs = require('fs')

// 检查指定目录／文件是否存在，不存在就创建一个
function createIfNotExist (path, content) {
  if (!fs.existsSync(path)) {
    if (content != null) {
      // 如果指定了 content，就根据 content 创建文件
      const fd = fs.openSync(path, 'w')
      fs.writeSync(fd, typeof content === 'object' ? JSON.stringify(content, null, '  ') : content)
    } else {
      // 否则创建一个目录
      fs.mkdirSync(path)
    }
  }
}

module.exports = {
  createIfNotExist
}
