import express from 'express'
import mongoose from 'mongoose'
import { createClient } from 'redis'

const schema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 500 },
  done: { type: Boolean, default: false },
}, { versionKey: false })

export const Todo = mongoose.model('Todo', schema)

export function createApp(redis) {
  const app = express()
  app.use(express.json())

  app.get('/', (_request, response) => response.send('Todo API'))
  app.get('/health', (_request, response) => response.send('ok'))
  app.get('/todos', async (_request, response) => response.json(await Todo.find({})))
  app.get('/todos/:id', async (request, response) => {
    const todo = await Todo.findById(request.params.id)
    if (!todo) return response.status(404).json({ error: 'Todo not found' })
    response.json(todo)
  })
  app.post('/todos', async (request, response) => {
    const { text } = request.body ?? {}
    if (typeof text !== 'string') return response.status(400).json({ error: 'Todo text is required' })
    const todo = await Todo.create({ text, done: false })
    await redis.incr('added_todos')
    response.status(201).json(todo)
  })
  app.put('/todos/:id', async (request, response) => {
    const { done, text } = request.body ?? {}
    if (typeof done !== 'boolean' || (text !== undefined && typeof text !== 'string')) {
      return response.status(400).json({ error: 'A valid done value and optional text are required' })
    }
    const changes = { done, ...(text === undefined ? {} : { text }) }
    const todo = await Todo.findByIdAndUpdate(request.params.id, changes, { new: true, runValidators: true })
    if (!todo) return response.status(404).json({ error: 'Todo not found' })
    response.json(todo)
  })
  app.delete('/todos/:id', async (request, response) => {
    await Todo.findByIdAndDelete(request.params.id)
    response.status(204).end()
  })
  app.get('/statistics', async (_request, response) => {
    response.json({ added_todos: Number((await redis.get('added_todos')) ?? 0) })
  })
  app.use((error, _request, response, next) => {
    if (response.headersSent) return next(error)
    if (error.name === 'CastError' || error.name === 'ValidationError' || error.type === 'entity.parse.failed') {
      return response.status(400).json({ error: 'Invalid todo request' })
    }
    console.error('Todo request failed:', error.name)
    response.status(500).json({ error: 'Unable to process the request' })
  })

  return app
}

const isMain = process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]
if (isMain) {
  const { MONGO_URL, REDIS_URL, PORT = 3000 } = process.env
  if (!MONGO_URL || !REDIS_URL) throw new Error('Set MONGO_URL and REDIS_URL')
  await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 10000 })
  const redis = createClient({ url: REDIS_URL })
  redis.on('error', () => console.error('Redis connection error'))
  await redis.connect()
  const server = createApp(redis).listen(PORT, () => console.log(`Todo API listening on ${PORT}`))
  const stop = () => server.close(async () => {
    await Promise.all([redis.quit(), mongoose.disconnect()])
  })
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
}
