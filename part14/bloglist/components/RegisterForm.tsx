'use client'
import { useActionState } from 'react'
import { registerUser } from '@/app/actions'
import { emptyFormState } from '@/lib/form-state'
export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, emptyFormState)
  return <form action={action} className="panel max-w-lg" noValidate>
    <label htmlFor="username" className="field">Username
      <input id="username" name="username" autoComplete="username" className="input mt-1"
        defaultValue={state.values.username || ''} required minLength={4} />
      {state.errors.username && <span className="error-text" data-testid="username-error">{state.errors.username}</span>}
    </label>
    <label htmlFor="name" className="field">Name
      <input id="name" name="name" autoComplete="name" className="input mt-1"
        defaultValue={state.values.name || ''} required />
      {state.errors.name && <span className="error-text" data-testid="name-error">{state.errors.name}</span>}
    </label>
    <label htmlFor="password" className="field">Password
      <input id="password" name="password" type="password" autoComplete="new-password"
        className="input mt-1" required minLength={4} />
      {state.errors.password && <span className="error-text" data-testid="password-error">{state.errors.password}</span>}
    </label>
    <label htmlFor="passwordConfirm" className="field">Confirm Password
      <input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password"
        className="input mt-1" required />
      {state.errors.passwordConfirm && <span className="error-text" data-testid="passwordConfirm-error">{state.errors.passwordConfirm}</span>}
    </label>
    {state.errors.form && <p role="alert" className="error-text">{state.errors.form}</p>}
    <button data-testid="register-button" className="button" type="submit" disabled={pending}>Register</button>
  </form>
}
