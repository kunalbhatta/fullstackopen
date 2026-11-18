'use client'

import { useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'
export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError('')
    try {
      const response = await signIn('credentials', { username, password, redirect: false })
      if (!response || response.error) {
        setError('Invalid username or password')
        setPending(false)
        return
      }
      document.cookie = 'practice_flash=Logged%20in%20successfully; Path=/; Max-Age=20; SameSite=Lax'
      window.location.assign('/')
    } catch {
      setError('Unable to log in. Please retry.')
      setPending(false)
    }
  }
  return <form onSubmit={submit} className="panel max-w-lg">
    {error && <p role="alert" data-testid="error-message" className="error-text mb-4">{error}</p>}
    <label htmlFor="username" className="field">Username
      <input id="username" name="username" autoComplete="username" className="input mt-1"
        value={username} onChange={event => setUsername(event.target.value)} required />
    </label>
    <label htmlFor="password" className="field">Password
      <input id="password" name="password" type="password" autoComplete="current-password"
        className="input mt-1" value={password} onChange={event => setPassword(event.target.value)} required />
    </label>
    <button className="button" type="submit" data-testid="login-button" disabled={pending}>Login</button>
  </form>
}
