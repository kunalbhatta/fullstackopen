const path = require('node:path')
const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()
const port = process.env.PORT || 3001

morgan.token('body', request => JSON.stringify(request.body))
app.use(morgan('tiny', { skip: request => request.method === 'POST' }))
app.use(morgan(`${morgan.tiny} :body`, { skip: request => request.method !== 'POST' }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

app.get('/api/persons', async (request, response) => {
  response.json(await Person.find({}))
})

app.get('/info', async (request, response) => {
  const requestedAt = new Date()
  const count = await Person.countDocuments()
  response.send(`<p>Phonebook has info for ${count} people</p><p>${requestedAt}</p>`)
})

app.get('/api/persons/:id', async (request, response) => {
  const person = await Person.findById(request.params.id)
  if (!person) return response.status(404).json({ error: 'Person not found' })
  response.json(person)
})

app.post('/api/persons', async (request, response) => {
  const { name, number } = request.body ?? {}
  if (typeof name !== 'string' || typeof number !== 'string') {
    return response.status(400).json({ error: 'Name and phone number are required' })
  }

  const person = await Person.create({ name, number })
  response.status(201).json(person)
})

app.put('/api/persons/:id', async (request, response) => {
  const { number } = request.body ?? {}
  if (typeof number !== 'string') {
    return response.status(400).json({ error: 'Phone number is required' })
  }

  const person = await Person.findByIdAndUpdate(
    request.params.id,
    { number },
    { new: true, runValidators: true },
  )

  if (!person) return response.status(404).json({ error: 'Person not found' })
  response.json(person)
})

app.delete('/api/persons/:id', async (request, response) => {
  const person = await Person.findByIdAndDelete(request.params.id)
  if (!person) return response.status(404).json({ error: 'Person not found' })
  response.status(204).end()
})

app.use((request, response) => {
  response.status(404).json({ error: 'Unknown endpoint' })
})

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error)
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'Invalid JSON request body' })
  }
  if (error.type === 'entity.too.large') {
    return response.status(413).json({ error: 'Request body is too large' })
  }
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Invalid person ID' })
  }
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(issue => issue.message).join('. ')
    return response.status(400).json({ error: message })
  }
  if (error.code === 11000) {
    return response.status(400).json({ error: 'Name must be unique' })
  }

  console.error('Phonebook request failed:', error.name)
  response.status(500).json({ error: 'Could not process the request' })
})

const start = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Set MONGODB_URI in part3/.env or the server environment')
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  await Person.init()
  app.listen(port, () => console.log(`Server running on port ${port}`))
}

start().catch(async error => {
  console.error('Could not start the Phonebook:', error.name)
  if (!process.env.MONGODB_URI) console.error(error.message)
  await mongoose.disconnect()
  process.exitCode = 1
})
