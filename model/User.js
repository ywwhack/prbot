const mongoose = require('mongoose')
const { toJSON } = require('./utils')

const UserSchema = mongoose.Schema({
  githubId: Number,
  name: String,
  access_token: String,
  notify: {
    state: { type: Boolean, default: true },
    time: [
      start: { type: String, default: '10:00' },
      end: { type: String, default: '20:00' }
    ]
  }
}, {
  toJSON: toJSON()
})

module.exports = mongoose.model('User', UserSchema)
