import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is required; see .env.example')
// postgres-js supports local PostgreSQL in CI and hosted Neon connections.
const queryClient = postgres(url, { max: 5, prepare: false })
export const db = drizzle(queryClient, { schema })
