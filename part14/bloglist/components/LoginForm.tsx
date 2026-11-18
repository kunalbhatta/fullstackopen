'use client'
import { useActionState } from 'react'
import { loginUser } from '@/app/actions'
import { emptyFormState } from '@/lib/form-state'
export default function LoginForm() {
  const [state, action, pending] = useActionState(loginUser, emptyFormState)
  return <form action={action} className="panel max-w-lg">
    {state.errors.form && <p role="alert" data-testid="error-message" className="error-text mb-4">{state.errors.form}</p>}
    <label htmlFor="username" className="field">Username
      <input id="username" name="username" autoComplete="username" className="input mt-1"
        defaultValue={state.values.username || ''} required />
    </label>
    <label htmlFor="password" className="field">Password
      <input id="password" name="password" type="password" autoComplete="current-password"
        className="input mt-1" required />
    </label>
    <button className="button" type="submit" data-testid="login-button" disabled={pending}>Login</button>
  </form>
}
