import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { BlogDetails } from '../src/components/Blog'

const blog = {
  title: 'Route Design',
  url: 'https://example.org/routes',
  likes: 3,
  user: { username: 'asha', name: 'Asha' },
}

test('guests can read the URL, number of likes and creator', () => {
  render(<BlogDetails blog={blog} />)
  expect(screen.getByRole('link', { name: blog.url })).toBeVisible()
  expect(screen.getByText('3 likes')).toBeVisible()
  expect(screen.getByText('Added by Asha')).toBeVisible()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('another user can like the blog and has no Remove button', () => {
  render(<BlogDetails blog={blog} viewer={{ username: 'dev' }} />)
  expect(screen.getByRole('button', { name: 'Like' })).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
})

test('the creator sees both Like and Remove controls', () => {
  render(<BlogDetails blog={blog} viewer={blog.user} />)
  expect(screen.getByRole('button', { name: 'Like' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Remove' })).toBeVisible()
})
