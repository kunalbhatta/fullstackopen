import { DataTypes as T } from 'sequelize'

export async function up({ context }) {
  await context.sequelize.transaction(async transaction => {
    await context.addColumn('blogs', 'year', { type: T.INTEGER }, { transaction })
    await context.createTable('readinglists', {
      id: { type: T.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: T.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      blog_id: { type: T.INTEGER, allowNull: false, references: { model: 'blogs', key: 'id' }, onDelete: 'CASCADE' },
      read: { type: T.BOOLEAN, allowNull: false, defaultValue: false },
    }, { transaction })
    await context.addConstraint('readinglists', {
      type: 'unique', fields: ['user_id', 'blog_id'], name: 'readinglists_user_blog_unique', transaction,
    })
  })
}

export async function down({ context }) {
  await context.sequelize.transaction(async transaction => {
    await context.dropTable('readinglists', { transaction })
    await context.removeColumn('blogs', 'year', { transaction })
  })
}
