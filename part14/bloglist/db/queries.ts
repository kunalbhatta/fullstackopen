import { and, desc, eq, ilike } from 'drizzle-orm'
import { db } from './index'
import { blogs, readingList, users } from './schema'

export function getBlogs(filter = '') {
  const term = filter.trim()
  return db.select().from(blogs).where(term ? ilike(blogs.title, '%' + term + '%') : undefined)
    .orderBy(desc(blogs.likes), desc(blogs.id))
}
export async function getBlogById(id: number) {
  if (!Number.isSafeInteger(id) || id < 1) return undefined
  const [blog] = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1)
  return blog
}
export function getUsers() {
  return db.select({ id: users.id, username: users.username, name: users.name })
    .from(users).orderBy(users.username)
}
export async function getUserByUsername(username: string) {
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)
  return user
}
export async function getUserById(id: number) {
  if (!Number.isSafeInteger(id) || id < 1) return undefined
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user
}
export function getUserWithBlogs(username: string) {
  return db.query.users.findFirst({ where: eq(users.username, username), with: { blogs: true } })
}
export function getReadingList(userId: number) {
  return db.query.readingList.findMany({
    where: eq(readingList.userId, userId), with: { blog: true }, orderBy: readingList.id,
  })
}
export async function isInReadingList(userId: number, blogId: number) {
  const [record] = await db.select({ id: readingList.id }).from(readingList)
    .where(and(eq(readingList.userId, userId), eq(readingList.blogId, blogId))).limit(1)
  return Boolean(record)
}
