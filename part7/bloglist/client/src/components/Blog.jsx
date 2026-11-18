import { useState } from 'react'

export function safeBlogUrl(value) {
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href
  } catch {
    return undefined
  }
}

export function BlogDetails({ blog, viewer, onLike, onRemove, busy }) {
  const href = safeBlogUrl(blog.url)
  return (
    <>
      <p>{href ? <a href={href}>{blog.url}</a> : blog.url}</p>
      <p>{blog.likes} likes</p>
      <p>Added by {blog.user?.name || blog.user?.username || 'Unknown user'}</p>
      {viewer && (
        <button type="button" disabled={busy} onClick={() => onLike(blog)}>
          Like
        </button>
      )}
      {viewer && viewer.username === blog.user?.username && (
        <button type="button" disabled={busy} onClick={() => onRemove(blog)}>
          Remove
        </button>
      )}
    </>
  )
}

export default function Blog({ blog, viewer, onLike, onRemove, busy }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <article>
      <h2>{blog.title}</h2>
      <p>{blog.author}</p>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? 'Hide' : 'View'}
      </button>
      {expanded && (
        <BlogDetails {...{ blog, viewer, onLike, onRemove, busy }} />
      )}
    </article>
  )
}
