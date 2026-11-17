import { useMutation } from '@apollo/client/react'
import { ADD_BOOK, LOGIN } from './graphql'

export function LoginForm({ onLogin, notify }) {
  const [login, { loading }] = useMutation(LOGIN)
  async function submit(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    try {
      const { data } = await login({ variables: Object.fromEntries(fields) })
      onLogin(data.login.value)
    } catch (error) {
      notify(error.message, true)
    }
  }

  return (
    <form onSubmit={submit}>
      <h1>Log in</h1>
      <label>Username <input name="username" autoComplete="username" required /></label>
      <label>Password <input name="password" type="password" autoComplete="current-password" required /></label>
      <button disabled={loading}>Log in</button>
    </form>
  )
}

export function BookForm({ onAdd, notify }) {
  const [addBook, { loading }] = useMutation(ADD_BOOK)
  async function submit(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    try {
      const { data } = await addBook({ variables: {
        title: fields.get('title').trim(),
        author: fields.get('author').trim(),
        published: Number(fields.get('published')),
        genres: fields.get('genres').split(',').map(value => value.trim()).filter(Boolean),
      } })
      onAdd(data.addBook)
    } catch (error) {
      notify(error.message, true)
    }
  }

  return (
    <form onSubmit={submit}>
      <h1>Add a book</h1>
      <label>Title <input name="title" required /></label>
      <label>Author <input name="author" required /></label>
      <label>Published <input name="published" type="number" step="1" required /></label>
      <label>Genres (comma separated) <input name="genres" /></label>
      <button disabled={loading}>Add book</button>
    </form>
  )
}
