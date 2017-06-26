const mongoose = require('mongoose')

// see: http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost/test')

mongoose.connection.on('error', console.error.bind(console, 'connection error:'))

module.exports = mongoose
