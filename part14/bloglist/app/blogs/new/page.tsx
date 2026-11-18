import type { Metadata } from 'next'
import BlogForm from '@/components/BlogForm'
export const metadata: Metadata = { title: 'Create a blog' }
export default function NewBlog() {
  return <section><h1 className="mb-6 text-3xl font-extrabold">Create a new blog</h1><BlogForm /></section>
}
