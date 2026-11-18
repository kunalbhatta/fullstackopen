import { DataTypes as T } from 'sequelize'

const id = () => ({ type: T.INTEGER, primaryKey: true, autoIncrement: true })
const timestamps = () => ({
  created_at: { type: T.DATE, allowNull: false },
  updated_at: { type: T.DATE, allowNull: false },
})

export async function up({ context }) {
  await context.sequelize.transaction(async transaction => {
    await context.createTable('users', {
      id: id(), name: { type: T.STRING, allowNull: false }, username: { type: T.STRING, unique: true, allowNull: false },
      password_hash: { type: T.STRING, allowNull: false }, ...timestamps(),
    }, { transaction })
    await context.createTable('blogs', {
      id: id(), title: { type: T.STRING, allowNull: false }, author: { type: T.STRING, allowNull: false },
      url: { type: T.TEXT, allowNull: false }, likes: { type: T.INTEGER, allowNull: false, defaultValue: 0 },
      user_id: { type: T.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      ...timestamps(),
    }, { transaction })
  })
}

export async function down({ context }) {
  await context.sequelize.transaction(async transaction => {
    await context.dropTable('blogs', { transaction })
    await context.dropTable('users', { transaction })
  })
}
