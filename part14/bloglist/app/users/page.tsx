import Link from 'next/link'
import type { Metadata } from 'next'
import { getUsers } from '@/db/queries'
export const metadata: Metadata = { title: 'Users' }
export default async function UsersPage() {
  const users = await getUsers()
  return <section><h1 className="mb-6 text-3xl font-extrabold">Users</h1>
    <ul className="space-y-3">{users.map(user => <li className="panel" key={user.id}>
      <Link className="font-bold text-blue-800 hover:underline"
        href={'/users/' + encodeURIComponent(user.username)}>{user.name}</Link>
      <span className="ml-3 text-sm text-slate-600">@{user.username}</span>
    </li>)}</ul>
  </section>
}
