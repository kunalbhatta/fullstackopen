import { DataTypes as T } from 'sequelize'

export async function up({ context }) {
  await context.sequelize.transaction(async transaction => {
    await context.addColumn('users', 'disabled', { type: T.BOOLEAN, allowNull: false, defaultValue: false }, { transaction })
    await context.createTable('sessions', {
      id: { type: T.UUID, primaryKey: true },
      user_id: { type: T.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      expires_at: { type: T.DATE, allowNull: false },
    }, { transaction })
  })
}

export async function down({ context }) {
  await context.sequelize.transaction(async transaction => {
    await context.dropTable('sessions', { transaction })
    await context.removeColumn('users', 'disabled', { transaction })
  })
}
