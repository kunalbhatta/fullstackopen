const { before, beforeEach, after, test } = require('node:test')
const assert = require('node:assert/strict')
const mongoose = require('mongoose')
const supertest = require('supertest')
const createApp = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(createApp({ secret: 'local-integration-test-secret' }))
const owner = { username: 'ashadev', name: 'Asha', password: 'test-pass-a' }
const peer = { username: 'devtester', name: 'Dev', password: 'test-pass-b' }
const newBlog = {
  title: 'The Browser',
  author: 'Dev',
  url: 'https://example.org/browser',
}

let ownerToken
let peerToken
let ownerId
let blogId

const login = async ({ username, password }) => {
  const { body } = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)
  return body.token
}

const saveBlog = (blog, token = ownerToken) =>
  api.post('/api/blogs').auth(token, { type: 'bearer' }).send(blog)

before(async () => {
  const uri = process.env.TEST_MONGODB_URI
  assert.ok(
    uri && uri !== process.env.MONGODB_URI,
    'Use a separate TEST_MONGODB_URI',
  )
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  await Promise.all([Blog.init(), User.init()])
})

beforeEach(async () => {
  await Promise.all([Blog.deleteMany({}), User.deleteMany({})])
  ownerId = (await api.post('/api/users').send(owner).expect(201)).body.id
  await api.post('/api/users').send(peer).expect(201)
  const tokens = await Promise.all([login(owner), login(peer)])
  ownerToken = tokens[0]
  peerToken = tokens[1]
  blogId = (await saveBlog({ ...newBlog, likes: 3 }).expect(201)).body.id
})

after(() => mongoose.disconnect())

test('GET returns blogs as JSON with the correct count and id', async () => {
  const { body } = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /json/)
  assert.equal(body.length, 1)
  assert.equal(body[0].id, blogId)
  assert.equal(body[0]._id, undefined)
  assert.equal(body[0].user.id, ownerId)
})

test('a logged-in user can create a blog and omitted likes default to zero', async () => {
  const { body } = await saveBlog(
    { ...newBlog, title: 'Testing' },
    peerToken,
  ).expect(201)
  assert.equal(body.title, 'Testing')
  assert.equal(body.likes, 0)
  assert.equal(body.user.username, peer.username)
  assert.equal(await Blog.countDocuments(), 2)
})

test('creation requires title and URL and rejects invalid likes', async () => {
  await saveBlog({ url: newBlog.url }).expect(400)
  await saveBlog({ title: newBlog.title }).expect(400)
  await saveBlog({ ...newBlog, likes: -1 }).expect(400)
  assert.equal(await Blog.countDocuments(), 1)
})

test('updating likes returns and persists the current total', async () => {
  const { body } = await api
    .put(`/api/blogs/${blogId}`)
    .auth(peerToken, { type: 'bearer' })
    .send({ likes: 12 })
    .expect(200)
  assert.equal(body.likes, 12)
  assert.equal((await Blog.findById(blogId)).likes, 12)
  await api
    .put(`/api/blogs/${blogId}`)
    .auth(ownerToken, { type: 'bearer' })
    .send({ likes: -1 })
    .expect(400)
  await api.put(`/api/blogs/${blogId}`).send({ likes: 13 }).expect(401)
})

test('only the creator can remove a blog and deleted blogs disappear from the user', async () => {
  await api.delete(`/api/blogs/${blogId}`).expect(401)
  await api
    .delete(`/api/blogs/${blogId}`)
    .auth(peerToken, { type: 'bearer' })
    .expect(403)
  assert.equal(await Blog.countDocuments(), 1)
  await api
    .delete(`/api/blogs/${blogId}`)
    .auth(ownerToken, { type: 'bearer' })
    .expect(204)
  assert.equal(await Blog.countDocuments(), 0)
  const { body } = await api.get(`/api/users/${ownerId}`).expect(200)
  assert.deepEqual(body.blogs, [])
})

test('invalid accounts are rejected and passwords are hashed', async () => {
  for (const badUser of [
    { username: 'xy', password: 'valid' },
    { username: 'longenough', password: 'no' },
    { username: owner.username, password: 'duplicate' },
    { username: 'nopassword' },
  ]) {
    const { body } = await api.post('/api/users').send(badUser).expect(400)
    assert.ok(body.error)
  }
  assert.equal(await User.countDocuments(), 2)
  const saved = await User.findById(ownerId).select('+passwordHash')
  assert.notEqual(saved.passwordHash, owner.password)
  assert.match(saved.passwordHash, /^\$2/)
})

test('users include their blogs and omit password hashes', async () => {
  const { body } = await api.get('/api/users').expect(200)
  const user = body.find((entry) => entry.id === ownerId)
  assert.equal(user.blogs[0].id, blogId)
  assert.equal(user.passwordHash, undefined)
})

test('login rejects incorrect passwords and creation rejects missing or invalid tokens', async () => {
  await api
    .post('/api/login')
    .send({ ...owner, password: 'invalid' })
    .expect(401)
  await api.post('/api/blogs').send(newBlog).expect(401)
  await saveBlog(newBlog, 'invalid').expect(401)
  assert.equal(await Blog.countDocuments(), 1)
})

test('malformed IDs, missing blogs, and production test-reset path are handled', async () => {
  await api.get('/api/blogs/invalid-id').expect(400)
  await api.get('/api/blogs/000000000000000000000001').expect(404)
  await api.post('/api/testing/reset').expect(404)
})
