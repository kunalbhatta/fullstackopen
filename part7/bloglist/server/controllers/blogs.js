const { Router } = require('express')
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

const creator = { path: 'user', select: 'username name' }

module.exports = (secret) => {
  const router = Router()
  const requireUser = userExtractor(secret)

  router.get('/', async (request, response) => {
    response.json(await Blog.find({}).populate(creator))
  })

  router.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id).populate(creator)
    if (!blog) return response.status(404).json({ error: 'Blog not found' })
    response.json(blog)
  })

  router.post('/', requireUser, async (request, response) => {
    const { title, author, url, likes } = request.body ?? {}
    const blog = await Blog.create({
      title,
      author,
      url,
      likes,
      user: request.user.id,
    })
    response.status(201).json(await blog.populate(creator))
  })

  router.put('/:id', requireUser, async (request, response) => {
    const { likes } = request.body ?? {}
    if (!Number.isInteger(likes) || likes < 0) {
      return response
        .status(400)
        .json({ error: 'Likes must be a non-negative integer' })
    }

    const blog = await Blog.findByIdAndUpdate(
      request.params.id,
      { likes },
      {
        new: true,
        runValidators: true,
      },
    ).populate(creator)
    if (!blog) return response.status(404).json({ error: 'Blog not found' })
    response.json(blog)
  })

  router.post('/:id/comments', async (request, response) => {
    const { comment } = request.body ?? {}
    if (
      typeof comment !== 'string' ||
      !comment.trim() ||
      comment.trim().length > 1000
    ) {
      return response
        .status(400)
        .json({ error: 'Comments must contain 1 to 1,000 characters' })
    }

    const blog = await Blog.findByIdAndUpdate(
      request.params.id,
      { $push: { comments: comment.trim() } },
      { new: true, runValidators: true },
    ).populate(creator)
    if (!blog) return response.status(404).json({ error: 'Blog not found' })
    response.status(201).json(blog)
  })

  router.delete('/:id', requireUser, async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (!blog) return response.status(404).json({ error: 'Blog not found' })
    if (!blog.user.equals(request.user._id)) {
      return response
        .status(403)
        .json({ error: 'Only the creator can remove this blog' })
    }

    await blog.deleteOne()
    response.status(204).end()
  })

  return router
}
