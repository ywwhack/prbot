function toJSON () {
  return {
    versionKey: false,
    transform: (doc, ret, options) => {
      delete ret._id
      return ret
    }
  }
}

module.exports = {
  toJSON
}
