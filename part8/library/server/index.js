import mongoose from 'mongoose'
import { createLibrary } from './app.js'
import { initializeModels } from './models.js'

const { MONGODB_URI, JWT_SECRET, DEMO_PASSWORD, PORT } = process.env
if (!MONGODB_URI || !JWT_SECRET) throw new Error('Set MONGODB_URI and JWT_SECRET in server/.env')

await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
await initializeModels()
const library = await createLibrary({ secret: JWT_SECRET, demoPassword: DEMO_PASSWORD })
const port = PORT || 4000
library.httpServer.listen(port, () => console.log(`GraphQL library at http://localhost:${port}/graphql`))

async function shutdown() {
  await library.stop()
  await mongoose.disconnect()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
