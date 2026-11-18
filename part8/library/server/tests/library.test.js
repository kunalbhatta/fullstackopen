import { once } from 'node:events'
import { readFile } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'
import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createClient } from 'graphql-ws'
import mongoose from 'mongoose'
import WebSocket from 'ws'
import { Author, Book, User, initializeModels } from '../models.js'
import { createLibrary } from '../app.js'

const password = 'local-test-password'
let library
let url
let token

async function graphql(query, variables, authorization) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: `Bearer ${authorization}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  return response.json()
}

const add = (title, authorization = token, author = 'New Writer') => graphql(
  'mutation Add($title:String!,$author:String!){addBook(title:$title,author:$author,published:2025,genres:["computing"]){id title author {name} genres}}',
  { title, author },
  authorization,
)

before(async () => {
  const uri = process.env.TEST_MONGODB_URI
  assert.ok(uri && uri !== process.env.MONGODB_URI, 'Use a separate TEST_MONGODB_URI')
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  await initializeModels()
  await Promise.all([Author.deleteMany({}), Book.deleteMany({}), User.deleteMany({})])
  const seed = JSON.parse(await readFile(new URL('../seed-data.json', import.meta.url), 'utf8'))
  const authors = await Author.insertMany(seed.authors)
  const byName = new Map(authors.map(author => [author.name, author.id]))
  await Book.insertMany(seed.books.map(book => ({ ...book, author: byName.get(book.author) })))

  library = await createLibrary({ secret: 'integration-test-secret' })
  library.httpServer.listen(0, '127.0.0.1')
  await once(library.httpServer, 'listening')
  url = `http://127.0.0.1:${library.httpServer.address().port}/graphql`

  const created = await graphql(
    'mutation($password:String!){createUser(username:"reader",favoriteGenre:"computing",password:$password){username}}',
    { password },
  )
  assert.equal(created.data?.createUser.username, 'reader')
  const loginResponse = await graphql('mutation($password:String!){login(username:"reader",password:$password){value}}', { password })
  token = loginResponse.data?.login.value
  assert.ok(token)
})

after(async () => {
  if (library) await library.stop()
  await mongoose.disconnect()
})

test('counts, nested authors, author-and-genre filtering, and empty results', async () => {
  const response = await graphql(`{
    bookCount
    authorCount
    allBooks(author: "Robert Martin", genre: "refactoring") { title author { name } }
    noMatch: allBooks(author: "Unknown", genre: "refactoring") { title }
  }`)
  assert.deepEqual(response.errors, undefined)
  assert.equal(response.data.bookCount, 7)
  assert.equal(response.data.authorCount, 5)
  assert.deepEqual(response.data.noMatch, [])
  assert.ok(response.data.allBooks.length > 0)
  assert.ok(response.data.allBooks.every(book => book.author.name === 'Robert Martin'))
})

test('allAuthors calculates book counts in one aggregate', async () => {
  const queries = []
  mongoose.set('debug', (collection, method) => queries.push(`${collection}.${method}`))
  try {
    const response = await graphql('{ allAuthors { id name bookCount } }')
    assert.equal(response.errors, undefined)
    assert.equal(response.data.allAuthors.find(author => author.name === 'Robert Martin').bookCount, 2)
    assert.deepEqual(queries.sort(), ['authors.find', 'books.aggregate'])
  } finally {
    mongoose.set('debug', false)
  }
})

test('authenticated viewer, private mutations, duplicate and validation errors', async () => {
  assert.equal((await graphql('{ me { username } }')).data.me, null)
  assert.equal((await graphql('{ me { username favoriteGenre } }', {}, token)).data.me.favoriteGenre, 'computing')
  assert.equal((await add('Unauthenticated book', 'invalid-token')).errors[0].extensions.code, 'UNAUTHENTICATED')
  assert.equal((await add('X')).errors[0].extensions.code, 'BAD_USER_INPUT')
  const created = await add('GraphQL at Work')
  assert.equal(created.data.addBook.author.name, 'New Writer')
  assert.equal((await add('GraphQL at Work')).errors[0].extensions.code, 'BAD_USER_INPUT')

  const updated = await graphql('mutation { editAuthor(name:"New Writer",setBornTo:1990){name born} }', {}, token)
  assert.deepEqual(updated.data.editAuthor, { name: 'New Writer', born: 1990 })
  const stored = await graphql('{ allBooks(genre:"computing"){title} }')
  assert.ok(stored.data.allBooks.some(book => book.title === 'GraphQL at Work'))
})

test('WebSocket subscription publishes a newly added book', { timeout: 8000 }, async () => {
  const subscriber = createClient({ url: url.replace('http:', 'ws:'), webSocketImpl: WebSocket })
  try {
    const connected = new Promise(resolve => subscriber.on('connected', resolve))
    const received = new Promise((resolve, reject) => {
      subscriber.subscribe({ query: 'subscription { bookAdded { title author { name } } }' }, {
        next: resolve,
        error: reject,
        complete() {},
      })
    })
    await connected
    await delay(75)
    await add('Live GraphQL')
    const update = await received
    assert.equal(update.data?.bookAdded.title, 'Live GraphQL')
    assert.equal(update.data?.bookAdded.author.name, 'New Writer')
  } finally {
    await subscriber.dispose()
  }
})
