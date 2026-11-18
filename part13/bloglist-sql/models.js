import { DataTypes as T } from 'sequelize'

export function defineModels(sequelize) {
  const User = sequelize.define('user', {
    username: { type: T.STRING, unique: true, allowNull: false, validate: { isEmail: true } },
    name: { type: T.STRING, allowNull: false, validate: { notEmpty: true } },
    passwordHash: { type: T.STRING, allowNull: false },
    disabled: { type: T.BOOLEAN, allowNull: false, defaultValue: false },
  }, { underscored: true, defaultScope: { attributes: { exclude: ['passwordHash'] } } })

  const Blog = sequelize.define('blog', {
    title: { type: T.STRING, allowNull: false, validate: { notEmpty: true } },
    author: { type: T.STRING, allowNull: false, validate: { notEmpty: true } },
    url: { type: T.TEXT, allowNull: false, validate: { isUrl: true } },
    likes: { type: T.INTEGER, defaultValue: 0, allowNull: false, validate: { min: 0, isInt: true } },
    year: {
      type: T.INTEGER,
      validate: {
        isInt: true,
        validYear(value) {
          if (value < 1991 || value > new Date().getFullYear()) throw new Error('Year must be between 1991 and this year')
        },
      },
    },
  }, { underscored: true })

  const ReadingList = sequelize.define('readinglist', {
    id: { type: T.INTEGER, autoIncrement: true, primaryKey: true },
    read: { type: T.BOOLEAN, allowNull: false, defaultValue: false },
  }, { underscored: true, timestamps: false })

  const Session = sequelize.define('session', {
    id: { type: T.UUID, primaryKey: true },
    expiresAt: { type: T.DATE, allowNull: false },
  }, { underscored: true, timestamps: false })

  User.hasMany(Blog, { foreignKey: 'userId' })
  Blog.belongsTo(User, { foreignKey: 'userId' })
  User.hasMany(ReadingList, { foreignKey: 'userId' })
  ReadingList.belongsTo(Blog, { foreignKey: 'blogId' })
  Session.belongsTo(User, { foreignKey: 'userId' })
  return { User, Blog, ReadingList, Session }
}
