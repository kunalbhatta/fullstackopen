import { Form } from '../styles'
import useField from '../hooks/useField'

export function LoginForm({ onLogin, busy }) {
  const username = useField('text')
  const password = useField('password')

  function submit(event) {
    event.preventDefault()
    onLogin({
      username: username.inputProps.value,
      password: password.inputProps.value,
    })
  }

  return (
    <Form onSubmit={submit}>
      <label>
        Username{' '}
        <input
          name="username"
          autoComplete="username"
          {...username.inputProps}
          required
        />
      </label>
      <label>
        Password{' '}
        <input
          name="password"
          autoComplete="current-password"
          {...password.inputProps}
          required
        />
      </label>
      <button disabled={busy}>login</button>
    </Form>
  )
}

export function BlogForm({ onCreate, busy }) {
  const title = useField('text')
  const author = useField('text')
  const url = useField('url')

  function submit(event) {
    event.preventDefault()
    onCreate({
      title: title.inputProps.value.trim(),
      author: author.inputProps.value.trim(),
      url: url.inputProps.value.trim(),
    })
  }

  return (
    <Form onSubmit={submit}>
      <label>
        Title <input name="title" {...title.inputProps} required />
      </label>
      <label>
        Author <input name="author" {...author.inputProps} required />
      </label>
      <label>
        URL <input name="url" {...url.inputProps} required />
      </label>
      <button disabled={busy}>create</button>
    </Form>
  )
}
