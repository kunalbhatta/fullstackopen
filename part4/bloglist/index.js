const mongoose = require('mongoose')
const createApp = require('./app')
const Blog = require('./models/blog')
const User = require('./models/user')

const isTestServer = process.argv.includes('--test-server')

const start = async () => {
  const { MONGODB_URI, TEST_MONGODB_URI, JWT_SECRET, PORT } = process.env
  const uri = isTestServer ? TEST_MONGODB_URI : MONGODB_URI
  if (!uri) throw new Error(isTestServer ? 'TEST_MONGODB_URI is required' : 'MONGODB_URI is required')
  if (isTestServer && uri === MONGODB_URI) throw new Error('Use a separate database for testing')

  const app = createApp({ secret: isTestServer ? 'bloglist-local-test-secret' : JWT_SECRET, allowReset: isTestServer })
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  await Promise.all([Blog.init(), User.init()])

  const port = PORT || 3003
  app.listen(port, isTestServer ? '127.0.0.1' : undefined, () => console.log(`Blog List API listening on ${port}`))
}

start().catch(async error => {
  console.error('Blog List could not start:', error instanceof mongoose.Error ? error.name : error.message)
  await mongoose.disconnect()
  process.exitCode = 1
})
