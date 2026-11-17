const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
  },
  number: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    minlength: [8, 'Phone number must be at least 8 characters long'],
    validate: {
      validator: number => /^\d{2,3}-\d+$/.test(number),
      message: 'Use two or three digits, a hyphen, then the remaining digits',
    },
  },
})

personSchema.index({ name: 1 }, {
  unique: true,
  collation: { locale: 'en', strength: 2 },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
