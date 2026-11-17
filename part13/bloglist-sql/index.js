import { database } from './db.js'
import { defineModels } from './models.js'
import { createApp } from './app.js'

const { DATABASE_URL, JWT_SECRET, DEMO_PASSWORD, PORT = 3001 } = process.env
const { sequelize, migrations } = database(DATABASE_URL)
try {
  const app = createApp(defineModels(sequelize), { secret: JWT_SECRET, demoPassword: DEMO_PASSWORD })
  await migrations.up()
  const server = app.listen(PORT, () => console.log(`SQL Blog List listening on ${PORT}`))
  const stop = () => server.close(() => { void sequelize.close() })
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
} catch (error) {
  await sequelize.close()
  throw error
}
