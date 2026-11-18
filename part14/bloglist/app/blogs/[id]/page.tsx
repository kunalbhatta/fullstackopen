import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getBlogById, isInReadingList } from '@/db/queries'
import { addToReadingList, likeBlog } from '@/app/actions'
type Props = { params: Promise<{id: string}> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const blog = await getBlogById(Number(id))
  return { title: blog?.title ?? 'Blog not found' }
}
export default async function BlogDetail({ params }: Props) {
  const { id } = await params
  const blog = await getBlogById(Number(id))
  if (!blog) notFound()
  const session = await auth()
  const userId = Number(session?.user?.id)
  const saved = Number.isSafeInteger(userId) && userId > 0 ? await isInReadingList(userId, blog.id) : false
  return <article data-testid="blog-detail" className="panel space-y-5">
    <p><Link className="text-sm font-medium text-blue-700 hover:underline" href="/blogs">Back to blogs</Link></p>
    <h1 className="text-3xl font-extrabold" data-testid="blog-title">{blog.title}</h1>
    <p data-testid="blog-author" className="text-lg text-slate-600">by {blog.author}</p>
    <p><a className="break-all text-blue-700 underline" href={blog.url} target="_blank" rel="noopener noreferrer">{blog.url}</a></p>
    <p className="font-semibold">{blog.likes} likes</p>
    <div className="flex flex-wrap gap-3">
      <form action={likeBlog}><input type="hidden" name="id" value={blog.id} />
        <button type="submit" className="button">Like</button>
      </form>
      {session?.user && !saved && <form action={addToReadingList}>
        <input type="hidden" name="blogId" value={blog.id} />
        <button type="submit" data-testid="add-to-reading-list-button" className="button-secondary">
          Add to Reading List
        </button>
      </form>}
      {saved && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">Saved to your reading list</p>}
    </div>
  </article>
}
