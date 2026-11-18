import mongoose from 'mongoose'

const { Schema } = mongoose

const authorSchema = new Schema({
  name: { type: String, required: true, minlength: 4, trim: true, unique: true },
  born: Number,
})

const bookSchema = new Schema({
  title: { type: String, required: true, minlength: 2, trim: true, unique: true },
  published: { type: Number, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'Author', required: true, index: true },
  genres: [{ type: String, trim: true }],
})
bookSchema.index({ genres: 1 })

const userSchema = new Schema({
  username: { type: String, required: true, minlength: 3, trim: true, unique: true },
  favoriteGenre: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
})

export const Author = mongoose.model('Author', authorSchema)
export const Book = mongoose.model('Book', bookSchema)
export const User = mongoose.model('User', userSchema)
export const initializeModels = () => Promise.all([Author.init(), Book.init(), User.init()])
