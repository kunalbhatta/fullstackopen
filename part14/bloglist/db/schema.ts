import { boolean, integer, pgTable, serial, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 160 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  token: varchar('token', { length: 128 }).unique(),
})

export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 300 }).notNull(),
  author: varchar('author', { length: 200 }).notNull(),
  url: varchar('url', { length: 2048 }).notNull(),
  likes: integer('likes').notNull().default(0),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
})

export const readingList = pgTable('reading_list', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  blogId: integer('blog_id').notNull().references(() => blogs.id, { onDelete: 'cascade' }),
  read: boolean('read').notNull().default(false),
}, (table) => [uniqueIndex('reading_list_user_blog').on(table.userId, table.blogId)])

export const usersRelations = relations(users, ({ many }) => ({
  blogs: many(blogs), readingList: many(readingList),
}))
export const blogsRelations = relations(blogs, ({ one, many }) => ({
  user: one(users, { fields: [blogs.userId], references: [users.id] }),
  readingLists: many(readingList),
}))
export const readingListRelations = relations(readingList, ({ one }) => ({
  user: one(users, { fields: [readingList.userId], references: [users.id] }),
  blog: one(blogs, { fields: [readingList.blogId], references: [blogs.id] }),
}))
