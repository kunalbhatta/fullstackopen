import { database } from './db.js'

const direction = process.argv[2]
if (!['up', 'down'].includes(direction)) throw new Error('Use up or down')
const { sequelize, migrations } = database(process.env.DATABASE_URL)
try {
  const result = await migrations[direction]()
  console.log(result.map(migration => migration.name).join('\n') || 'No pending migration')
} finally {
  await sequelize.close()
}
