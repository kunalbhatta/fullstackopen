import { fileURLToPath } from 'node:url'
import { Sequelize } from 'sequelize'
import { Umzug, SequelizeStorage } from 'umzug'

export function database(url) {
  if (!url) throw new Error('Set DATABASE_URL')
  const sequelize = new Sequelize(url, { dialect: 'postgres', logging: false })
  const migrations = new Umzug({
    migrations: { glob: ['*.js', { cwd: fileURLToPath(new URL('./migrations/', import.meta.url)) }] },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
  })
  return { sequelize, migrations }
}
