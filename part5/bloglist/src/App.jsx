import { useState } from 'react'
import Blog from './components/Blog'
import { BlogForm, LoginForm } from './components/Forms'
import useBlogList from './useBlogList'

export default function App() {
  const { viewer, blogs, notice, busy, login, logout, create, like, remove } = useBlogList()
  const [creating, setCreating] = useState(false)

  async function createAndClose(values) {
    if (await create(values)) setCreating(false)
  }

  return (
    <main>
      <h1>Blog List</h1>
      {notice && <p role={notice.error ? 'alert' : 'status'}>{notice.message}</p>}
      {!viewer ? <LoginForm onLogin={login} busy={busy} /> : (
        <>
          <p>{viewer.name || viewer.username} signed in <button onClick={logout}>Log out</button></p>
          {creating ? (
            <>
              <BlogForm onCreate={createAndClose} busy={busy} />
              <button onClick={() => setCreating(false)}>Cancel</button>
            </>
          ) : <button onClick={() => setCreating(true)}>Create new blog</button>}
          {blogs?.toSorted((first, second) => second.likes - first.likes).map(blog => (
            <Blog key={blog.id} blog={blog} viewer={viewer} onLike={like} onRemove={remove} busy={busy} />
          ))}
        </>
      )}
    </main>
  )
}
