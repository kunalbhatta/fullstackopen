'use server'

import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { and, eq, sql } from 'drizzle-orm'
import { AuthError } from 'next-auth'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth, signIn, signOut } from '@/auth'
import { db } from '@/db'
import { getBlogById, getUserByUsername } from '@/db/queries'
import { blogs, readingList, users } from '@/db/schema'
import type { FormState } from '@/lib/form-state'

async function flash(message: string) {
  (await cookies()).set('practice_flash', message, {
    httpOnly: false, path: '/', sameSite: 'lax', maxAge: 20, secure: process.env.NODE_ENV === 'production',
  })
}
async function currentUserId() {
  const session = await auth()
  const userId = Number(session?.user?.id)
  if (!Number.isSafeInteger(userId) || userId < 1) throw new Error('Please log in to continue')
  return userId
}
function field(form: FormData, key: string) {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function registerUser(_previous: FormState, form: FormData): Promise<FormState> {
  const username = field(form, 'username').toLowerCase()
  const name = field(form, 'name')
  const password = typeof form.get('password') === 'string' ? String(form.get('password')) : ''
  const passwordConfirm = typeof form.get('passwordConfirm') === 'string' ? String(form.get('passwordConfirm')) : ''
  const values = { username, name }
  const errors: Record<string, string> = {}
  if (username.length < 4) errors.username = 'Username must be at least 4 characters'
  if (!name) errors.name = 'Name is required'
  if (password.length < 4) errors.password = 'Password must be at least 4 characters'
  if (password !== passwordConfirm) errors.passwordConfirm = 'Passwords do not match'
  if (!errors.username && await getUserByUsername(username)) errors.username = 'Username already exists'
  if (Object.keys(errors).length) return { errors, values }
  try {
    await db.insert(users).values({ username, name, passwordHash: await bcrypt.hash(password, 10) })
  } catch (error) {
    if (String(error).includes('unique') || String(error).includes('duplicate')) {
      return { errors: { username: 'Username already exists' }, values }
    }
    throw error
  }
  await flash('Account created successfully')
  redirect('/login')
}

export async function loginUser(_previous: FormState, form: FormData): Promise<FormState> {
  const username = field(form, 'username')
  const password = typeof form.get('password') === 'string' ? String(form.get('password')) : ''
  try {
    await signIn('credentials', { username, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return { errors: { form: 'Invalid username or password' }, values: { username } }
    }
    throw error
  }
  await flash('Logged in successfully')
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logoutUser() {
  await flash('Logged out successfully')
  await signOut({ redirectTo: '/' })
}

export async function createBlog(_previous: FormState, form: FormData): Promise<FormState> {
  const title = field(form, 'title')
  const author = field(form, 'author')
  const url = field(form, 'url')
  const values = { title, author, url }
  const errors: Record<string, string> = {}
  if (title.length < 5) errors.title = 'Title must be at least 5 characters'
  if (author.length < 5) errors.author = 'Author must be at least 5 characters'
  if (url.length < 5) errors.url = 'URL must be at least 5 characters'
  if (!errors.url) {
    try {
      if (!['https:', 'http:'].includes(new URL(url).protocol)) errors.url = 'URL must use http or https'
    } catch { errors.url = 'Enter a valid URL' }
  }
  const session = await auth()
  const userId = Number(session?.user?.id)
  if (!Number.isSafeInteger(userId) || userId < 1) errors.form = 'Log in before creating blogs'
  if (Object.keys(errors).length) return { errors, values }
  const [saved] = await db.insert(blogs).values({ title, author, url, userId }).returning({ id: blogs.id })
  await db.insert(readingList).values({ userId, blogId: saved.id }).onConflictDoNothing()
  await flash('Blog created successfully')
  revalidatePath('/blogs')
  revalidatePath('/me')
  redirect('/blogs')
}

export async function likeBlog(form: FormData) {
  const id = Number(field(form, 'id'))
  if (!Number.isSafeInteger(id) || id < 1) return
  await db.update(blogs).set({ likes: sql.raw('likes + 1') }).where(eq(blogs.id, id))
  revalidatePath('/blogs')
  revalidatePath('/blogs/' + id)
}

export async function addToReadingList(form: FormData) {
  const userId = await currentUserId()
  const blogId = Number(field(form, 'blogId'))
  if (!await getBlogById(blogId)) return
  await db.insert(readingList).values({ userId, blogId }).onConflictDoNothing()
  revalidatePath('/me')
  revalidatePath('/blogs/' + blogId)
}

export async function markAsRead(form: FormData) {
  const userId = await currentUserId()
  const id = Number(field(form, 'entryId'))
  if (!Number.isSafeInteger(id) || id < 1) return
  await db.update(readingList).set({ read: true })
    .where(and(eq(readingList.id, id), eq(readingList.userId, userId)))
  revalidatePath('/me')
}

export async function generateApiToken() {
  const userId = await currentUserId()
  await db.update(users).set({ token: randomUUID() }).where(eq(users.id, userId))
  revalidatePath('/me')
}
