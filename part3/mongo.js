const mongoose = require('mongoose')
const Person = require('./models/person')

const args = process.argv.slice(2)
const [password, name, number] = args
const uri = process.env.MONGODB_URI

const run = async () => {
  if (!uri) throw new Error('Set MONGODB_URI before running the database command')
  if (![0, 1, 3].includes(args.length) || (args.length === 3 && (!name || !number))) {
    throw new Error('Usage: node mongo.js [password ["name" number]]')
  }

  const connectionString = password
    ? uri.replace(/^(mongodb(?:\+srv)?:\/\/[^:/@]+:)[^@]*@/, (match, prefix) => {
      return `${prefix}${encodeURIComponent(password)}@`
    })
    : uri

  await mongoose.connect(connectionString, { serverSelectionTimeoutMS: 10000 })
  if (name && number) {
    await Person.init()
    const person = await Person.create({ name, number })
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    return
  }

  console.log('phonebook:')
  for (const person of await Person.find({})) {
    console.log(`${person.name} ${person.number}`)
  }
}

run().catch(error => {
  if (error.name === 'ValidationError' || error.name === 'Error') {
    console.error(error.message)
  } else if (error.code === 11000) {
    console.error('Name must be unique')
  } else {
    console.error('Database command failed:', error.name)
  }
  process.exitCode = 1
}).finally(() => mongoose.disconnect())
