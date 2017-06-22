const fs = require('fs')
const path = require('path')
const { createIfNotExist } = require('../../share/utils')

const BINDING_FILE = path.resolve(process.cwd(), 'data', 'binding.json')
createIfNotExist(BINDING_FILE, {})
const binding = require(BINDING_FILE)

module.exports = {
  BINDING_FILE,
  binding
}
