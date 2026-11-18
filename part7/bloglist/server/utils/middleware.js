const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization') ?? ''
  request.token = /^Bearer (\S+)$/i.exec(authorization)?.[1]
  next()
}

const userExtractor = (secret) => async (request, response, next) => {
  if (!request.token)
    return response.status(401).json({ error: 'Token is required' })

  const { id } = jwt.verify(request.token, secret, { algorithms: ['HS256'] })
  const user = await User.findById(id)
  if (!user) return response.status(401).json({ error: 'Unknown user' })
  request.user = user
  next()
}

const unknownEndpoint = (request, response) =>
  response.status(404).json({ error: 'Unknown endpoint' })

const errorHandler = (error, request, response, next) => {
  if (response.headersSent) return next(error)
  if (
    ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(
      error.name,
    )
  ) {
    return response.status(401).json({ error: 'Invalid or expired token' })
  }
  if (error.name === 'CastError')
    return response.status(400).json({ error: 'Invalid ID' })
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors)
      .map((issue) => issue.message)
      .join('. ')
    return response.status(400).json({ error: message })
  }
  if (error.code === 11000)
    return response.status(400).json({ error: 'Username must be unique' })
  if (error.type === 'entity.parse.failed')
    return response.status(400).json({ error: 'Invalid JSON' })
  if (error.type === 'entity.too.large')
    return response.status(413).json({ error: 'Request body is too large' })
  console.error('Blog list request failed:', error.name)
  response.status(500).json({ error: 'Unable to process the request' })
}

module.exports = {
  tokenExtractor,
  userExtractor,
  unknownEndpoint,
  errorHandler,
}
