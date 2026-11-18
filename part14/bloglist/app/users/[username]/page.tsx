import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUserWithBlogs } from '@/db/queries'
type Props = { params: Promise<{username: string}> }
export default async function UserPage({ params }: Props) {
  const { username } = await params
  const user = await getUserWithBlogs(username)
  if (!user) notFound()
  return <section className="space-y-5">
    <header className="panel"><h1 className="text-3xl font-extrabold">{user.name}</h1>
      <p className="text-slate-500">@{user.username}</p></header>
    <h2 className="text-xl font-bold">Blogs created</h2>
    <ul className="panel list-inside list-disc space-y-2">
      {user.blogs.map(blog => <li key={blog.id}>
        <Link href={'/blogs/' + blog.id} className="text-blue-700 hover:underline">{blog.title}</Link>
      </li>)}
    </ul>
    {user.blogs.length === 0 && <p>No published blogs yet.</p>}
  </section>
}
