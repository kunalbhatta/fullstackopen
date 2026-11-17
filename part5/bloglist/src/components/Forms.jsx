import { useState } from 'react'

export function LoginForm({ onLogin, busy }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function submit(event) {
    event.preventDefault()
    onLogin({ username, password })
  }

  return (
    <form onSubmit={submit}>
      <label>Username <input autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required /></label>
      <label>Password <input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
      <button disabled={busy}>Log in</button>
    </form>
  )
}

export function BlogForm({ onCreate, busy }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  function submit(event) {
    event.preventDefault()
    onCreate({ title: title.trim(), author: author.trim(), url: url.trim() })
  }

  return (
    <form onSubmit={submit}>
      <label>Title <input value={title} onChange={event => setTitle(event.target.value)} required /></label>
      <label>Author <input value={author} onChange={event => setAuthor(event.target.value)} required /></label>
      <label>URL <input type="url" value={url} onChange={event => setUrl(event.target.value)} required /></label>
      <button disabled={busy}>Create</button>
    </form>
  )
}
