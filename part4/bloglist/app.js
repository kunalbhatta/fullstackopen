const express = require('express')
const blogs = require('./controllers/blogs')
const users = require('./controllers/users')
const login = require('./controllers/login')
const Blog = require('./models/blog')
const User = require('./models/user')
const { tokenExtractor, unknownEndpoint, errorHandler } = require('./utils/middleware')

module.exports = ({ secret, allowReset = false }) => {
  if (!secret) throw new Error('JWT_SECRET is required')

  const app = express()
  app.use(express.json())
  app.use(tokenExtractor)
  app.use('/api/blogs', blogs(secret))
  app.use('/api/users', users)
  app.use('/api/login', login(secret))

  if (allowReset) {
    app.post('/api/testing/reset', async (request, response) => {
      await Blog.deleteMany({})
      await User.deleteMany({})
      response.status(204).end()
    })
  }

  app.use(unknownEndpoint)
  app.use(errorHandler)
  return app
}
