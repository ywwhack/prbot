const nodemailer = require('nodemailer')
const path = require('path')

let mailInstacne = {}
try {
  const MAIL_CONFIG_PATH = path.resolve(process.cwd(), 'mail.config.js')
  const auth = require(MAIL_CONFIG_PATH)
  mailInstacne = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth 
  })
  mailInstacne.originSendMail = mailInstacne.sendMail
  mailInstacne.sendMail = function (options, callback) {
    const mailOptions = Object.assign({ from: auth.user }, options)
    mailInstacne.originSendMail(mailOptions, callback)
  }
} catch (e) {
  console.log('未提供邮件账户信息，将不启用邮件服务！')
  // fake sendMail method, do nothing
  mailInstacne.sendMail = function () {}
}

module.exports = mailInstacne
