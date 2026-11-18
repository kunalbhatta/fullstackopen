import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'

export async function GET(request: NextRequest) {
  const header = request.headers.get('authorization') || ''
  const match = /^Bearer ([a-zA-Z0-9-]+)$/.exec(header)
  if (!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [user] = await db.select({ id: users.id, name: users.name, username: users.username })
    .from(users).where(eq(users.token, match[1])).limit(1)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(user)
}
