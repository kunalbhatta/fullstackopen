import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import mongoose from 'mongoose'
import { createClient } from 'redis'
import { createApp, Todo } from './index.js'

test('MongoDB stores each todo and Redis counts additions', async () => {
  const { TEST_MONGO_URL, TEST_REDIS_URL } = process.env
  assert.ok(TEST_MONGO_URL && TEST_REDIS_URL, 'Set dedicated test MongoDB and Redis URLs')
  await mongoose.connect(TEST_MONGO_URL)
  const redis = createClient({ url: TEST_REDIS_URL })
  await redis.connect()
  const server = createApp(redis).listen(0, '127.0.0.1')
  await once(server, 'listening')
  const root = `http://127.0.0.1:${server.address().port}`
  const send = (method, path, data) => fetch(root + path, {
    method,
    headers: data === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
  try {
    await Todo.deleteMany({})
    await redis.del('added_todos')
    assert.deepEqual(await (await send('GET', '/statistics')).json(), { added_todos: 0 })
    const response = await send('POST', '/todos', { text: 'Container practice' })
    assert.equal(response.status, 201)
    const { _id, done } = await response.json()
    assert.equal(done, false)
    assert.equal((await send('GET', `/todos/${_id}`)).status, 200)
    const changed = await send('PUT', `/todos/${_id}`, { done: true })
    assert.equal((await changed.json()).done, true)
    assert.equal((await send('GET', '/todos/000000000000000000000001')).status, 404)
    assert.equal((await send('POST', '/todos', { text: ' ' })).status, 400)
    assert.deepEqual(await (await send('GET', '/statistics')).json(), { added_todos: 1 })
    await redis.set('added_todos', '9001')
    assert.equal((await send('POST', '/todos', { text: 'Counter exercise' })).status, 201)
    assert.deepEqual(await (await send('GET', '/statistics')).json(), { added_todos: 9002 })
    assert.equal((await send('DELETE', `/todos/${_id}`)).status, 204)
    assert.equal(await Todo.countDocuments({}), 1)
  } finally {
    server.close()
    await once(server, 'close')
    await Promise.all([redis.quit(), mongoose.disconnect()])
  }
})
