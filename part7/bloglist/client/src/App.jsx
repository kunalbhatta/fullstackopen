import PageBoundary from './components/PageBoundary'
import UserDirectory from './components/UserDirectory'
import useField from './hooks/useField'
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { BlogDetails } from './components/Blog'
import { BlogForm, LoginForm } from './components/Forms'
import {
  BlogLinks,
  Form,
  GlobalStyle,
  Main,
  Navigation,
  Notice,
  Panel,
} from './styles'
import useBlogList from './useBlogList'

function BlogList({ blogs }) {
  if (!blogs) return <p>Loading blogs…</p>
  if (blogs.length === 0) return <p>No blogs yet.</p>

  return (
    <BlogLinks aria-label="Blogs">
      {blogs
        .toSorted((first, second) => second.likes - first.likes)
        .map((blog) => (
          <li key={blog.id}>
            <NavLink to={`/blogs/${blog.id}`}>{blog.title}</NavLink>
            <span>{blog.author}</span>
          </li>
        ))}
    </BlogLinks>
  )
}

function Comments({ blog, onComment, busy }) {
  const field = useField('text')
  const comments = blog.comments ?? []

  async function submit(event) {
    event.preventDefault()
    const content = field.inputProps.value.trim()
    if (content && (await onComment(blog.id, content))) field.reset()
  }

  return (
    <section>
      <h2>Comments</h2>
      {comments.length ? (
        <ul>
          {comments.map((text, index) => (
            <li key={index}>{text}</li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
      <Form onSubmit={submit}>
        <label>
          Comment <input {...field.inputProps} required maxLength={1000} />
        </label>
        <button disabled={busy}>Add comment</button>
      </Form>
    </section>
  )
}

function SingleBlog({ blogs, viewer, busy, like, remove, comment }) {
  const { id } = useParams()
  const navigate = useNavigate()
  if (!blogs) return <p>Loading blog…</p>
  const blog = blogs.find((entry) => entry.id === id)
  if (!blog) return <p>Blog not found.</p>
  if (!blog.user) throw new Error('Blog creator data is unavailable')

  async function removeAndReturn(entry) {
    if (await remove(entry)) navigate('/')
  }

  return (
    <Panel>
      <h1>{blog.title}</h1>
      <p>{blog.author}</p>
      <BlogDetails
        blog={blog}
        viewer={viewer}
        busy={busy}
        onLike={like}
        onRemove={removeAndReturn}
      />
      <Comments blog={blog} onComment={comment} busy={busy} />
    </Panel>
  )
}

export default function App() {
  const {
    viewer,
    blogs,
    notice,
    busy,
    login,
    logout,
    create,
    like,
    remove,
    comment,
  } = useBlogList()
  const navigate = useNavigate()
  const location = useLocation()

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
        <NavLink to="/" end>
          blogs
        </NavLink>
        <NavLink to="/users">users</NavLink>
        {viewer ? (
          <>
            <NavLink to="/new">new blog</NavLink>
            <span>{viewer.name || viewer.username} signed in</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                logout()
                navigate('/')
              }}
            >
              logout
            </button>
          </>
        ) : (
          <NavLink to="/login">login</NavLink>
        )}
      </Navigation>
      <Main>
        {notice && (
          <Notice
            $error={notice.error}
            role={notice.error ? 'alert' : 'status'}
          >
            {notice.message}
          </Notice>
        )}
        <PageBoundary key={location.key}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <h1>blogs</h1>
                  <BlogList blogs={blogs} />
                </>
              }
            />
            <Route
              path="/login"
              element={
                viewer ? (
                  <Navigate to="/" replace />
                ) : (
                  <Panel>
                    <h1>Log in</h1>
                    <LoginForm onLogin={loginAndReturn} busy={busy} />
                  </Panel>
                )
              }
            />
            <Route
              path="/new"
              element={
                viewer ? (
                  <Panel>
                    <h1>Create blog</h1>
                    <BlogForm
                      onCreate={createAndReturn}
                      busy={busy || !blogs}
                    />
                  </Panel>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/users/:id?" element={<UserDirectory />} />
            <Route
              path="/blogs/:id"
              element={
                <SingleBlog
                  {...{ blogs, viewer, busy, like, remove, comment }}
                />
              }
            />
            <Route
              path="*"
              element={
                <>
                  <h1>Page not found</h1>
                  <NavLink to="/">Go to blogs</NavLink>
                </>
              }
            />
          </Routes>
        </PageBoundary>
      </Main>
    </>
  )
}
