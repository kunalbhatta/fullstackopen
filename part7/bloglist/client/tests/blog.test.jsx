import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import Blog from '../src/components/Blog'
import { BlogForm } from '../src/components/Forms'

const blog = {
  id: '1',
  title: 'Making APIs',
  author: 'Asha',
  url: 'https://example.org/api',
  likes: 2,
  user: { username: 'asha', name: 'Asha' },
}

test('blog shows title and author and hides URL and likes initially', () => {
  render(<Blog blog={blog} viewer={blog.user} />)
  expect(screen.getByText(blog.title)).toBeInTheDocument()
  expect(screen.getByText(blog.author)).toBeInTheDocument()
  expect(screen.queryByText(blog.url)).not.toBeInTheDocument()
  expect(screen.queryByText('2 likes')).not.toBeInTheDocument()
})

test('view and hide toggle the blog details', async () => {
  const user = userEvent.setup()
  render(<Blog blog={blog} viewer={blog.user} />)
  await user.click(screen.getByRole('button', { name: 'View' }))
  expect(screen.getByRole('link', { name: blog.url })).toBeVisible()
  expect(screen.getByText('2 likes')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Hide' }))
  expect(screen.queryByText('2 likes')).not.toBeInTheDocument()
})

test('two like clicks call the handler twice', async () => {
  const user = userEvent.setup()
  const onLike = vi.fn()
  render(<Blog blog={blog} viewer={blog.user} onLike={onLike} />)
  await user.click(screen.getByRole('button', { name: 'View' }))
  await user.click(screen.getByRole('button', { name: 'Like' }))
  await user.click(screen.getByRole('button', { name: 'Like' }))
  expect(onLike).toHaveBeenCalledTimes(2)
  expect(onLike).toHaveBeenCalledWith(blog)
})

test('the create form passes title, author and URL to the handler', async () => {
  const user = userEvent.setup()
  const onCreate = vi.fn()
  render(<BlogForm onCreate={onCreate} />)
  await user.type(screen.getByRole('textbox', { name: 'Title' }), blog.title)
  await user.type(screen.getByRole('textbox', { name: 'Author' }), blog.author)
  await user.type(screen.getByRole('textbox', { name: 'URL' }), blog.url)
  await user.click(screen.getByRole('button', { name: 'create' }))
  expect(onCreate).toHaveBeenCalledExactlyOnceWith({
    title: blog.title,
    author: blog.author,
    url: blog.url,
  })
})
