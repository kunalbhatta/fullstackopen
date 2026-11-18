import { database } from './db.js'
import { defineModels } from './models.js'

const { sequelize } = database(process.env.DATABASE_URL)
try {
  const { Blog } = defineModels(sequelize)
  for (const blog of await Blog.findAll({ order: [['likes', 'DESC']] })) {
    console.log(`${blog.author}: '${blog.title}', ${blog.likes} likes`)
  }
} finally {
  await sequelize.close()
}
