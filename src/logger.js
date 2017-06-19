const { Logger, transports } = require('winston')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { LOGS_DIR } = require('./constants/paths')
const mailInstance = require('./mail')

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR)
}

function dateFormatter () {
  return moment().format('MM/DD HH:mm:ss')
}

exports.dateFormatter = dateFormatter
exports.initLogger = function initLogger (type) {
  const logger = new Logger({
    transports: [
      new transports.File({
        timestamp: dateFormatter,
        name: 'file.info',
        filename: path.resolve(LOGS_DIR, `${type}-info.log`),
        level: 'info'
      }),
      new transports.File({
        json: false,
        formatter ({ message, meta }) {
          // 发送 error 信息到指定邮件
          const output = Object.assign(meta, { message, timestamp: dateFormatter() })
          mailInstance.sendMail({
            to: 'weiwei.ye@ele.me',
            subject: 'prbot has error',
            text: JSON.stringify(Object.assign(output, { type }), null, '  ')
          })
          return JSON.stringify(output)
        },
        name: 'file.error',
        filename: path.resolve(LOGS_DIR, `${type}-error.log`),
        level: 'error',
        handleExceptions: true
      })
    ],
    exitOnError: false
  })

  return logger
}
