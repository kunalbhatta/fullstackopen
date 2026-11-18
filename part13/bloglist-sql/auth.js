import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export function authentication({ User, Session }, secret) {
  if (!secret) throw new Error('Set JWT_SECRET')

  const requireUser = async (request, response, next) => {
    const token = /^Bearer (\S+)$/i.exec(request.get('authorization') ?? '')?.[1]
    let claims
    try { claims = token && jwt.verify(token, secret, { algorithms: ['HS256'] }) }
    catch { return response.status(401).json({ error: 'Invalid or expired token' }) }

    if (!claims?.jti) return response.status(401).json({ error: 'Token is required' })
    const session = await Session.findByPk(claims.jti, { include: User })
    if (!session || session.expiresAt <= new Date() || !session.user || session.user.disabled) {
      return response.status(401).json({ error: 'Session is no longer active' })
    }
    request.session = session
    request.user = session.user
    next()
  }

  const login = async (request, response) => {
    const { username, password } = request.body ?? {}
    if (typeof username !== 'string' || typeof password !== 'string' || bcrypt.truncates(password)) {
      return response.status(401).json({ error: 'Invalid username or password' })
    }
    const user = await User.unscoped().findOne({ where: { username: username.trim().toLowerCase() } })
    if (!user || user.disabled || !(await bcrypt.compare(password, user.passwordHash))) {
      return response.status(401).json({ error: 'Invalid username or password' })
    }

    const id = randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await Session.create({ id, expiresAt, userId: user.id })
    const token = jwt.sign({ id: user.id }, secret, { jwtid: id, expiresIn: '1h' })
    response.json({ token, id: user.id, username: user.username, name: user.name })
  }

  return { requireUser, login }
}
