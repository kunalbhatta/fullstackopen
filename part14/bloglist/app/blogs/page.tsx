import Link from 'next/link'
import type { Metadata } from 'next'
import { getBlogs } from '@/db/queries'
export const metadata: Metadata = { title: 'Blogs' }
export default async function BlogsPage({ searchParams }: {searchParams: Promise<{filter?: string}>}) {
  const { filter = '' } = await searchParams
  const all = await getBlogs(filter)
  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-3xl font-extrabold">Blogs</h1>
        <p className="mt-2 text-slate-600">Explore articles, sorted by popularity.</p></div>
      <Link className="button" href="/blogs/new">New blog</Link>
    </div>
    <form action="/blogs" method="get" className="panel flex flex-wrap items-end gap-3">
      <label className="grow font-medium" htmlFor="filter">Search by title
        <input id="filter" type="search" name="filter" data-testid="filter-input"
          className="input mt-2" defaultValue={filter} />
      </label>
      <button data-testid="search-button" type="submit" className="button">Search</button>
    </form>
    <ul className="space-y-3" data-testid="blogs-list">
      {all.map(blog => <li key={blog.id} className="panel flex items-start justify-between gap-4">
        <div><Link href={'/blogs/' + blog.id} className="font-bold text-blue-800 hover:underline">{blog.title}</Link>
          <p className="mt-1 text-sm text-slate-600">{blog.author}</p></div>
        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-900">{blog.likes} likes</span>
      </li>)}
    </ul>
    {all.length === 0 && <p className="panel">No blogs found.</p>}
  </section>
}
