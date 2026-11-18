const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,
    trim: true,
  },
  name: { type: String, default: '', trim: true },
  passwordHash: { type: String, required: true, select: false },
})

schema.virtual('blogs', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'user',
})
schema.set('toJSON', {
  transform: (document, json) => {
    json.id = json._id.toString()
    if (document.populated('blogs'))
      json.blogs = document.blogs.map((blog) => blog.toJSON())
    delete json._id
    delete json.__v
    delete json.passwordHash
  },
})

module.exports = mongoose.model('User', schema)
