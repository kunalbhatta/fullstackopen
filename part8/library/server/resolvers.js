import bcrypt from 'bcryptjs'
import { GraphQLError } from 'graphql'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { PubSub } from 'graphql-subscriptions'
import { Author, Book, User } from './models.js'

const eventName = 'BOOK_ADDED'

const badInput = message => new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } })
const unauthenticated = message => new GraphQLError(message, { extensions: { code: 'UNAUTHENTICATED' } })

function requireUser(user) {
  if (!user) throw unauthenticated('Sign in to make changes')
}

async function validateWrite(action) {
  try {
    return await action()
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw badInput(Object.values(error.errors).map(entry => entry.message).join('. '))
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern ?? {})[0]
      throw badInput(field ? `The ${field} already exists` : 'A matching record already exists')
    }
    throw error
  }
}

export function tokenUser(authorization, secret) {
  const token = /^Bearer (\S+)$/i.exec(authorization ?? '')?.[1]
  if (!token) return null

  let decoded
  try {
    decoded = jwt.verify(token, secret, { algorithms: ['HS256'] })
  } catch {
    return null
  }
  return mongoose.isValidObjectId(decoded.id) ? User.findById(decoded.id) : null
}

export default function makeResolvers({ secret, demoPassword }) {
  const pubsub = new PubSub()
  return {
    Query: {
      bookCount: () => Book.countDocuments().exec(),
      authorCount: () => Author.countDocuments().exec(),
      allGenres: async () => (await Book.distinct('genres')).sort(),
      me: (root, args, { currentUser }) => currentUser,
      allAuthors: async () => {
        const [authors, totals] = await Promise.all([
          Author.find({}).lean(),
          Book.aggregate([{ $group: { _id: '$author', count: { $sum: 1 } } }]),
        ])
        const counts = new Map(totals.map(entry => [String(entry._id), entry.count]))
        return authors.map(author => ({ ...author, bookCount: counts.get(String(author._id)) ?? 0 }))
      },
      allBooks: async (root, { author, genre }) => {
        const filter = {}
        if (author) {
          const found = await Author.findOne({ name: author })
          if (!found) return []
          filter.author = found._id
        }
        if (genre) filter.genres = genre
        return Book.find(filter).populate('author')
      },
    },
    Author: {
      id: author => String(author._id),
      bookCount: author => author.bookCount ?? Book.countDocuments({ author: author._id }).exec(),
    },
    Mutation: {
      createUser: (root, { username, favoriteGenre, password }) => validateWrite(async () => {
        const chosen = password ?? demoPassword
        if (typeof chosen !== 'string' || chosen.length < 8 || bcrypt.truncates(chosen)) {
          throw badInput('Provide a password of at least eight characters and at most 72 UTF-8 bytes')
        }
        return User.create({ username, favoriteGenre, passwordHash: await bcrypt.hash(chosen, 10) })
      }),
      login: async (root, { username, password }) => {
        const user = await User.findOne({ username }).select('+passwordHash')
        if (!user || bcrypt.truncates(password) || !(await bcrypt.compare(password, user.passwordHash))) {
          throw unauthenticated('Invalid username or password')
        }
        return { value: jwt.sign({ id: user.id }, secret, { expiresIn: '1h' }) }
      },
      addBook: (root, { title, author, published, genres }, { currentUser }) => {
        requireUser(currentUser)
        return validateWrite(async () => {
          const normalizedTitle = title.trim()
          const authorName = author.trim()
          if (normalizedTitle.length < 2 || authorName.length < 4) {
            throw badInput('Title must have at least 2 characters and author name at least 4')
          }
          if (await Book.exists({ title: normalizedTitle })) throw badInput('The title already exists')
          const writer = await Author.findOneAndUpdate(
            { name: authorName },
            { $setOnInsert: { name: authorName } },
            { new: true, upsert: true, runValidators: true },
          )
          const book = await Book.create({
            title: normalizedTitle, author: writer._id, published,
            genres: [...new Set(genres.map(genre => genre.trim()).filter(Boolean))],
          })
          await book.populate('author')
          await pubsub.publish(eventName, { bookAdded: book })
          return book
        })
      },
      editAuthor: (root, { name, setBornTo }, { currentUser }) => {
        requireUser(currentUser)
        return validateWrite(() => Author.findOneAndUpdate(
          { name }, { born: setBornTo }, { new: true, runValidators: true },
        ))
      },
    },
    Subscription: {
      bookAdded: { subscribe: () => pubsub.asyncIterableIterator(eventName) },
    },
  }
}
