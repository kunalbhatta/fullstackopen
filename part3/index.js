const path = require('node:path')
const { randomUUID } = require('node:crypto')
const express = require('express')
const morgan = require('morgan')

const app = express()
const port = process.env.PORT || 3001

let persons = [
  { id: '1', name: 'Arto Hellas', number: '040-123456' },
  { id: '2', name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: '3', name: 'Dan Abramov', number: '12-43-234345' },
  { id: '4', name: 'Mary Poppendieck', number: '39-23-6423122' },
]

morgan.token('body', request => JSON.stringify(request.body))
app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.json())
app.use(morgan('tiny', { skip: request => request.method === 'POST' }))
app.use(morgan(`${morgan.tiny} :body`, { skip: request => request.method !== 'POST' }))

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
  const person = persons.find(entry => entry.id === request.params.id)
  if (!person) return response.status(404).end()
  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  persons = persons.filter(entry => entry.id !== request.params.id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body ?? {}
  if (typeof name !== 'string' || !name.trim() || typeof number !== 'string' || !number.trim()) {
    return response.status(400).json({ error: 'name and number are required' })
  }
  if (persons.some(entry => entry.name.toLowerCase() === name.trim().toLowerCase())) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  const person = { id: randomUUID(), name: name.trim(), number: number.trim() }
  persons.push(person)
  response.status(201).json(person)
})

app.listen(port, () => console.log(`Server running on port ${port}`))
