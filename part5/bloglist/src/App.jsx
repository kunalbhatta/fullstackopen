import { Navigate, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { BlogDetails } from './components/Blog'
import { BlogForm, LoginForm } from './components/Forms'
import { BlogLinks, GlobalStyle, Main, Navigation, Notice, Panel } from './styles'
import useBlogList from './useBlogList'

function BlogList({ blogs }) {
  if (!blogs) return <p>Loading blogs…</p>
  if (blogs.length === 0) return <p>No blogs yet.</p>

  return (
    <BlogLinks aria-label="Blogs">
      {blogs.toSorted((first, second) => second.likes - first.likes).map(blog => (
        <li key={blog.id}>
          <NavLink to={`/blogs/${blog.id}`}>{blog.title}</NavLink>
          <span>{blog.author}</span>
        </li>
      ))}
    </BlogLinks>
  )
}

function SingleBlog({ blogs, viewer, busy, like, remove }) {
  const { id } = useParams()
  const navigate = useNavigate()
  if (!blogs) return <p>Loading blog…</p>
  const blog = blogs.find(entry => entry.id === id)
  if (!blog) return <p>Blog not found.</p>

  async function removeAndReturn(entry) {
    if (await remove(entry)) navigate('/')
  }

  return (
    <Panel>
      <h1>{blog.title}</h1>
      <p>{blog.author}</p>
      <BlogDetails blog={blog} viewer={viewer} busy={busy} onLike={like} onRemove={removeAndReturn} />
    </Panel>
  )
}

export default function App() {
  const { viewer, blogs, notice, busy, login, logout, create, like, remove } = useBlogList()
  const navigate = useNavigate()

  async function loginAndReturn(credentials) {
    if (await login(credentials)) navigate('/')
  }

  async function createAndReturn(fields) {
    if (await create(fields)) navigate('/')
  }

  return (
    <>
      <GlobalStyle />
      <Navigation aria-label="Main navigation">
        <NavLink to="/" end>Blogs</NavLink>
        {viewer ? (
          <>
            <NavLink to="/new">Create blog</NavLink>
            <span>{viewer.name || viewer.username} signed in</span>
            <button type="button" disabled={busy} onClick={() => { logout(); navigate('/') }}>Log out</button>
          </>
        ) : <NavLink to="/login">Log in</NavLink>}
      </Navigation>
      <Main>
        {notice && <Notice $error={notice.error} role={notice.error ? 'alert' : 'status'}>{notice.message}</Notice>}
        <Routes>
          <Route path="/" element={<><h1>Blog List</h1><BlogList blogs={blogs} /></>} />
          <Route path="/login" element={viewer ? <Navigate to="/" replace /> : (
            <Panel><h1>Log in</h1><LoginForm onLogin={loginAndReturn} busy={busy} /></Panel>
          )} />
          <Route path="/new" element={viewer ? (
            <Panel><h1>Create blog</h1><BlogForm onCreate={createAndReturn} busy={busy || !blogs} /></Panel>
          ) : <Navigate to="/login" replace />} />
          <Route path="/blogs/:id" element={<SingleBlog {...{ blogs, viewer, busy, like, remove }} />} />
          <Route path="*" element={<><h1>Page not found</h1><NavLink to="/">Go to blogs</NavLink></>} />
        </Routes>
      </Main>
    </>
  )
}
