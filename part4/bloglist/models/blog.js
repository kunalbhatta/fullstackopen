const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, default: '', trim: true },
  url: { type: String, required: true, trim: true },
  likes: { type: Number, default: 0, min: 0, validate: Number.isInteger },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
})

schema.set('toJSON', {
  transform: (document, json) => {
    json.id = json._id.toString()
    delete json._id
    delete json.__v
  },
})

module.exports = mongoose.model('Blog', schema)
