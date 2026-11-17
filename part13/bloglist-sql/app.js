import express from 'express'
import bcrypt from 'bcryptjs'
import { fn, col, Op } from 'sequelize'
import { authentication } from './auth.js'

const publicUser = ['id', 'name', 'username']
const blogSummary = ['id', 'title', 'author', 'url', 'likes', 'year']
const badRequest = (response, error) => response.status(400).json({ error })
const notFound = (response, type) => response.status(404).json({ error: `${type} not found` })
const forbidden = response => response.status(403).json({ error: 'You do not own this record' })

export function createApp(models, { secret, demoPassword } = {}) {
  const { User, Blog, ReadingList } = models
  const { requireUser, login } = authentication(models, secret)
  const app = express()
  const api = express.Router()
  app.use(express.json())
  app.use('/api', api)

  api.post('/login', login)
  api.delete('/logout', requireUser, async (request, response) => {
    await request.session.destroy()
    response.status(204).end()
  })

  api.get('/blogs', async (request, response) => {
    const { search } = request.query
    if (search !== undefined && typeof search !== 'string') return badRequest(response, 'Search must be text')
    const escaped = search?.replace(/[\\%_]/g, '\\$&')
    const match = escaped ? { [Op.iLike]: `%${escaped}%` } : undefined

    response.json(await Blog.findAll({
      where: match ? { [Op.or]: [{ title: match }, { author: match }] } : undefined,
      include: [{ model: User, attributes: publicUser }],
      order: [['likes', 'DESC'], ['id', 'ASC']],
    }))
  })

  api.post('/blogs', requireUser, async (request, response) => {
    const { title, author, url, year, likes } = request.body ?? {}
    if ([title, author, url].some(value => typeof value !== 'string' || !value.trim()) ||
        (year !== undefined && year !== null && !Number.isInteger(year)) ||
        (likes !== undefined && (!Number.isInteger(likes) || likes < 0))) {
      return badRequest(response, 'Provide a title, author, URL, and valid year and likes when supplied')
    }
    const blog = await Blog.create({
      title: title.trim(), author: author.trim(), url: url.trim(), year, likes, userId: request.user.id,
    })
    await blog.reload({ include: [{ model: User, attributes: publicUser }] })
    response.status(201).json(blog)
  })

  api.put('/blogs/:id', requireUser, async (request, response) => {
    const { likes } = request.body ?? {}
    if (!Number.isInteger(likes) || likes < 0) return badRequest(response, 'Likes must be a non-negative integer')
    const blog = await Blog.findByPk(request.params.id, { include: [{ model: User, attributes: publicUser }] })
    if (!blog) return notFound(response, 'Blog')
    await blog.update({ likes })
    response.json(blog)
  })

  api.delete('/blogs/:id', requireUser, async (request, response) => {
    const blog = await Blog.findByPk(request.params.id)
    if (!blog) return notFound(response, 'Blog')
    if (blog.userId !== request.user.id) return forbidden(response)
    await blog.destroy()
    response.status(204).end()
  })

  api.get('/authors', async (_request, response) => {
    const rows = await Blog.findAll({
      attributes: ['author', [fn('COUNT', col('id')), 'articles'], [fn('SUM', col('likes')), 'likes']],
      group: ['author'],
      order: [[fn('SUM', col('likes')), 'DESC'], ['author', 'ASC']],
      raw: true,
    })
    response.json(rows.map(row => ({ author: row.author, articles: Number(row.articles), likes: Number(row.likes) })))
  })

  api.get('/users', async (_request, response) => {
    response.json(await User.findAll({ attributes: publicUser, include: [{ model: Blog, attributes: blogSummary }] }))
  })

  api.post('/users', async (request, response) => {
    const { name, username, password = demoPassword } = request.body ?? {}
    if (typeof username !== 'string' || typeof name !== 'string' ||
        typeof password !== 'string' || password.length < 6 || bcrypt.truncates(password)) {
      return badRequest(response, 'Provide name, email and a password of at least 6 characters')
    }
    const user = await User.create({
      name: name.trim(), username: username.trim().toLowerCase(), passwordHash: await bcrypt.hash(password, 10),
    })
    response.status(201).json({ id: user.id, name: user.name, username: user.username })
  })

  api.put('/users/:username', requireUser, async (request, response) => {
    const { username } = request.body ?? {}
    if (typeof username !== 'string') return badRequest(response, 'Username must be an email')
    if (request.user.username !== request.params.username.toLowerCase()) return forbidden(response)
    await request.user.update({ username: username.trim().toLowerCase() })
    response.json({ id: request.user.id, username: request.user.username, name: request.user.name })
  })

  api.get('/users/:id', async (request, response) => {
    const { read } = request.query
    if (read !== undefined && read !== 'true' && read !== 'false') return badRequest(response, 'Read must be true or false')
    const user = await User.findByPk(request.params.id, { attributes: publicUser })
    if (!user) return notFound(response, 'User')
    const rows = await ReadingList.findAll({
      where: { userId: user.id, ...(read === undefined ? {} : { read: read === 'true' }) },
      include: [{ model: Blog, attributes: blogSummary }],
      order: [['id', 'ASC']],
    })
    response.json({ ...user.toJSON(), readings: rows.map(row => ({
      ...row.blog.toJSON(), readinglists: [{ id: row.id, read: row.read }],
    })) })
  })

  api.post('/readinglists', requireUser, async (request, response) => {
    const { blogId, userId = request.user.id } = request.body ?? {}
    if (!Number.isInteger(blogId) || !Number.isInteger(userId)) return badRequest(response, 'Valid blog and user IDs are required')
    if (userId !== request.user.id) return forbidden(response)
    response.status(201).json(await ReadingList.create({ blogId, userId }))
  })

  api.put('/readinglists/:id', requireUser, async (request, response) => {
    const { read } = request.body ?? {}
    if (typeof read !== 'boolean') return badRequest(response, 'Read must be a boolean')
    const row = await ReadingList.findByPk(request.params.id)
    if (!row) return notFound(response, 'Reading list entry')
    if (row.userId !== request.user.id) return forbidden(response)
    response.json(await row.update({ read }))
  })

  app.use((_request, response) => notFound(response, 'Endpoint'))
  app.use((error, _request, response, next) => {
    if (response.headersSent) return next(error)
    if (error.name === 'SequelizeUniqueConstraintError') return badRequest(response, 'This record already exists')
    if (error.name === 'SequelizeValidationError') {
      return badRequest(response, error.errors.map(issue => issue.message).join('. '))
    }
    if (error.name === 'SequelizeForeignKeyConstraintError' || error.parent?.code === '22P02' || error.type === 'entity.parse.failed') {
      return badRequest(response, 'Invalid record or request')
    }
    console.error('Blog List error:', error.name)
    response.status(500).json({ error: 'Unable to complete the request' })
  })

  return app
}
