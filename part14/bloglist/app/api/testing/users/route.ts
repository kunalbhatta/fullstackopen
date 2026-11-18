import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import { users } from '@/db/schema'
import { getUserByUsername } from '@/db/queries'

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }
  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const username = typeof body.username === 'string' ? body.username.toLowerCase().trim() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (username.length < 4 || !name || password.length < 4) {
    return NextResponse.json({ error: 'Invalid user fields' }, { status: 400 })
  }
  if (await getUserByUsername(username)) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
  }
  const [user] = await db.insert(users).values({
    username, name, passwordHash: await bcrypt.hash(password, 10),
  }).returning({ id: users.id, username: users.username, name: users.name })
  return NextResponse.json(user, { status: 201 })
}
