const { Router } = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user')

const router = Router()

router.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', 'title author url likes user')
  response.json(users)
})

router.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id).populate('blogs', 'title author url likes user')
  if (!user) return response.status(404).json({ error: 'User not found' })
  response.json(user)
})

router.post('/', async (request, response) => {
  const { username, name, password } = request.body ?? {}
  if (typeof username !== 'string' || username.trim().length < 3) {
    return response.status(400).json({ error: 'Username must be at least 3 characters long' })
  }
  if (typeof password !== 'string' || password.length < 3 || bcrypt.truncates(password)) {
    return response.status(400).json({ error: 'Password must be at least 3 characters and at most 72 UTF-8 bytes' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ username, name, passwordHash })
  response.status(201).json(user)
})

module.exports = router
