'use client'
import { useActionState } from 'react'
import { createBlog } from '@/app/actions'
import { emptyFormState } from '@/lib/form-state'
export default function BlogForm() {
  const [state, action, pending] = useActionState(createBlog, emptyFormState)
  return <form action={action} className="panel max-w-xl" noValidate>
    {state.errors.form && <p role="alert" className="error-text mb-4">{state.errors.form}</p>}
    <label htmlFor="title" className="field">Title
      <input id="title" className="input mt-1" name="title" type="text" required minLength={5}
        defaultValue={state.values.title || ''} />
      {state.errors.title && <span data-testid="title-error" className="error-text">{state.errors.title}</span>}
    </label>
    <label htmlFor="author" className="field">Author
      <input id="author" className="input mt-1" name="author" type="text" required minLength={5}
        defaultValue={state.values.author || ''} />
      {state.errors.author && <span data-testid="author-error" className="error-text">{state.errors.author}</span>}
    </label>
    <label htmlFor="url" className="field">URL
      <input id="url" className="input mt-1" name="url" type="url" required minLength={5}
        defaultValue={state.values.url || ''} />
      {state.errors.url && <span data-testid="url-error" className="error-text">{state.errors.url}</span>}
    </label>
    <button data-testid="create-blog-button" type="submit" disabled={pending} className="button">Create</button>
  </form>
}
