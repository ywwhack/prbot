const { Logger, transports } = require('winston')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { LOGS_DIR } = require('./constants/paths')

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR)
}

function dateFormatter () {
  return moment().format('MM/DD h:mm:ss')
}

exports.initLogger = function initLogger (type) {
  return new Logger({
    transports: [
      new transports.File({
        timestamp: dateFormatter,
        name: 'file.info',
        filename: path.resolve(LOGS_DIR, `${type}-info.log`),
        level: 'info'
      }),
      new transports.File({
        timestamp: dateFormatter,
        name: 'file.error',
        filename: path.resolve(LOGS_DIR, `${type}-error.log`),
        level: 'error',
        handleExceptions: true
      })
    ],
    exitOnError: false
  })
}
