const mongoose = require('mongoose')
const { toJSON } = require('./utils')

const UserSchema = mongoose.Schema({
  githubId: Number,
  name: String,
  access_token: String,
  notify: {
    state: { type: Boolean, default: true },
    time: {
      type: Array,
      default () {
        return ['10:00', '20:00']
      }
    }
  }
}, {
  toJSON: toJSON()
})

module.exports = mongoose.model('User', UserSchema)
