import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import { getUserById, getReadingList } from '@/db/queries'
import { generateApiToken, markAsRead } from '@/app/actions'
export const metadata: Metadata = { title: 'My profile' }
export default async function Profile() {
  const session = await auth()
  const userId = Number(session?.user?.id)
  if (!Number.isSafeInteger(userId) || userId < 1) redirect('/login')
  const user = await getUserById(userId)
  if (!user) redirect('/login')
  const entries = await getReadingList(userId)
  const unread = entries.filter(entry => !entry.read)
  const read = entries.filter(entry => entry.read)
  return <section className="space-y-6">
    <div className="panel" data-testid="user-profile">
      <h1 className="mb-3 text-3xl font-extrabold">My profile</h1>
      <p data-testid="user-name" className="text-lg">{user.name}</p>
      <p data-testid="user-username" className="text-slate-600">@{user.username}</p>
    </div>
    <section className="panel space-y-4" data-testid="api-token-section">
      <h2 className="text-xl font-bold">Personal API token</h2>
      {user.token ? <p data-testid="token-display" className="break-all rounded-lg bg-slate-100 p-3">
        <code data-testid="api-token">{user.token}</code>
      </p> : <p data-testid="no-token-message">No token generated yet.</p>}
      <form action={generateApiToken}>
        <button data-testid="generate-token-button" type="submit" className="button">
          {user.token ? 'Regenerate token' : 'Generate token'}
        </button>
      </form>
    </section>
    <section className="panel space-y-4" data-testid="reading-list-section">
      <h2 className="text-xl font-bold">My reading list</h2>
      {entries.length === 0 && <p data-testid="empty-reading-list">Your reading list is empty.</p>}
      <div data-testid="unread-section" className="space-y-3">
        <h3 className="font-bold">Unread</h3>
        {unread.length === 0 && <p data-testid="no-unread-blogs" className="text-sm text-slate-500">No unread blogs.</p>}
        {unread.map(entry => <div key={entry.id}
          className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3">
          <Link className="font-medium text-blue-700 hover:underline"
            href={'/blogs/' + entry.blog.id}>{entry.blog.title}</Link>
          <form action={markAsRead}><input type="hidden" name="entryId" value={entry.id} />
            <button data-testid={'mark-read-' + entry.id} className="button-secondary" type="submit">Mark as read</button>
          </form>
        </div>)}
      </div>
      <div data-testid="read-section" className="space-y-3">
        <h3 className="font-bold">Read</h3>
        {read.length === 0 && <p className="text-sm text-slate-500">No read blogs yet.</p>}
        {read.map(entry => <p key={entry.id}>
          <Link className="text-blue-700 hover:underline" href={'/blogs/' + entry.blog.id}>{entry.blog.title}</Link>
        </p>)}
      </div>
    </section>
  </section>
}
