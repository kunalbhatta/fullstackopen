const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

module.exports = (secret) => {
  const router = Router()

  router.post('/', async (request, response) => {
    const { username, password } = request.body ?? {}
    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      bcrypt.truncates(password)
    ) {
      return response
        .status(401)
        .json({ error: 'Invalid username or password' })
    }

    const user = await User.findOne({ username: username.trim() }).select(
      '+passwordHash',
    )
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return response
        .status(401)
        .json({ error: 'Invalid username or password' })
    }

    const token = jwt.sign({ id: user.id, username: user.username }, secret, {
      expiresIn: '1h',
    })
    response.json({
      token,
      username: user.username,
      name: user.name,
      id: user.id,
    })
  })

  return router
}
