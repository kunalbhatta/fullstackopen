import { readFile } from 'node:fs/promises'
import mongoose from 'mongoose'
import { Author, Book, initializeModels } from './models.js'

const uri = process.env.MONGODB_URI
if (!uri) throw new Error('Set MONGODB_URI before seeding the library')

const seed = JSON.parse(await readFile(new URL('./seed-data.json', import.meta.url), 'utf8'))
await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
try {
  await initializeModels()
  const authors = new Map()
  for (const author of seed.authors) {
    const saved = await Author.findOneAndUpdate({ name: author.name }, { $setOnInsert: author }, { upsert: true, new: true })
    authors.set(author.name, saved.id)
  }
  for (const book of seed.books) {
    await Book.updateOne({ title: book.title }, { $setOnInsert: {
      ...book, author: authors.get(book.author),
    } }, { upsert: true })
  }
  console.log('Seed data is ready.')
} finally {
  await mongoose.disconnect()
}
