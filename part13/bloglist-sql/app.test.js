import assert from 'node:assert/strict'
import { once } from 'node:events'
import { after, before, test } from 'node:test'
import { database } from './db.js'
import { defineModels } from './models.js'
import { createApp } from './app.js'

const connection = process.env.TEST_DATABASE_URL
const password = 'practice-only-password'
let context
let models
let server
let root
let alice
let bob

async function send(method, url, payload, token) {
  const headers = {}
  if (payload !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(root + url, { method, headers, body: JSON.stringify(payload) })
  return { status: response.status, body: response.status === 204 ? null : await response.json() }
}

before(async () => {
  assert.ok(connection && new URL(connection).pathname.endsWith('_test') &&
    connection !== process.env.DATABASE_URL, 'Use a dedicated test database ending in _test')
  context = database(connection)
  await context.migrations.down({ to: 0 })
  assert.equal((await context.migrations.up()).length, 3)
  assert.equal((await context.migrations.up()).length, 0)
  models = defineModels(context.sequelize)
  server = createApp(models, { secret: 'sql-test-secret' }).listen(0, '127.0.0.1')
  await once(server, 'listening')
  root = `http://127.0.0.1:${server.address().port}/api`

  for (const [username, name] of [['alice@example.org', 'Alice'], ['bob@example.org', 'Bob']]) {
    const result = await send('POST', '/users', { username, name, password })
    assert.equal(result.status, 201)
    assert.equal(result.body.passwordHash, undefined)
  }
  alice = (await send('POST', '/login', { username: 'alice@example.org', password })).body
  bob = (await send('POST', '/login', { username: 'bob@example.org', password })).body
  assert.ok(alice.token && bob.token)
})

after(async () => {
  if (server) {
    server.close()
    await once(server, 'close')
  }
  if (context) {
    await context.migrations.down({ to: 0 })
    await context.sequelize.close()
  }
})

test('user validation, login and ownership checks', async () => {
  assert.equal((await send('POST', '/users', { name: 'Bad email', username: 'bad', password })).status, 400)
  assert.equal((await send('POST', '/users', { name: 'Duplicate', username: alice.username, password })).status, 400)
  assert.equal((await send('POST', '/login', { username: alice.username, password: 'wrong' })).status, 401)
  assert.equal((await send('PUT', '/users/alice@example.org', { username: 'another@example.org' }, bob.token)).status, 403)
})

let firstBlog
let secondBlog

test('blogs validate year, include creators, filter author or title and sort by likes', async () => {
  const values = { title: 'Testing PostgreSQL', author: 'Sam Example', url: 'https://example.org/sql', year: 2020, likes: 5 }
  assert.equal((await send('POST', '/blogs', values)).status, 401)
  assert.equal((await send('POST', '/blogs', { ...values, year: 1900 }, alice.token)).status, 400)
  const created = await send('POST', '/blogs', values, alice.token)
  assert.equal(created.status, 201)
  firstBlog = created.body
  assert.equal(firstBlog.user.name, 'Alice')
  secondBlog = (await send('POST', '/blogs', { ...values, title: 'Other article', likes: 2 }, bob.token)).body
  assert.equal((await send('PUT', `/blogs/${secondBlog.id}`, { likes: 9 }, alice.token)).status, 200)
  assert.equal((await send('DELETE', `/blogs/${firstBlog.id}`, undefined, bob.token)).status, 403)
  const all = (await send('GET', '/blogs?search=sam')).body
  assert.deepEqual(all.map(blog => blog.likes), [9, 5])
  assert.equal((await send('GET', '/blogs?search=postgresql')).body.length, 1)
  assert.equal((await send('GET', '/blogs?search=%25')).body.length, 0)
  assert.deepEqual((await send('GET', '/authors')).body, [{ author: 'Sam Example', articles: 2, likes: 14 }])
  assert.equal((await send('GET', '/users')).body.find(user => user.id === alice.id).blogs[0].id, firstBlog.id)
})

test('reading list joins are unique, scoped to the owner and filter by read status', async () => {
  assert.equal((await send('POST', '/readinglists', { userId: bob.id, blogId: firstBlog.id }, alice.token)).status, 403)
  const saved = await send('POST', '/readinglists', { userId: alice.id, blogId: secondBlog.id }, alice.token)
  assert.equal(saved.status, 201)
  const row = saved.body
  assert.equal(row.read, false)
  assert.equal((await send('POST', '/readinglists', { blogId: secondBlog.id }, alice.token)).status, 400)
  assert.equal((await send('PUT', `/readinglists/${row.id}`, { read: true }, bob.token)).status, 403)
  assert.equal((await send('PUT', `/readinglists/${row.id}`, { read: true }, alice.token)).status, 200)
  const info = (await send('GET', `/users/${alice.id}?read=true`)).body
  assert.deepEqual(info.readings[0].readinglists, [{ id: row.id, read: true }])
  assert.equal((await send('GET', `/users/${alice.id}?read=false`)).body.readings.length, 0)
})

test('logout and account disabling invalidate existing tokens', async () => {
  await models.User.update({ disabled: true }, { where: { id: bob.id } })
  assert.equal((await send('DELETE', `/blogs/${secondBlog.id}`, undefined, bob.token)).status, 401)
  assert.equal((await send('POST', '/login', { username: bob.username, password })).status, 401)
  assert.equal((await send('DELETE', '/logout', undefined, alice.token)).status, 204)
  assert.equal((await send('DELETE', `/blogs/${firstBlog.id}`, undefined, alice.token)).status, 401)
})
