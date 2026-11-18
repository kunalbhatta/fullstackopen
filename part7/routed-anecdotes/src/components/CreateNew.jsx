import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAnecdotes, useField } from '../hooks'

export default function CreateNew() {
  const content = useField('text')
  const author = useField('text')
  const info = useField('url')
  const { anecdotes, addAnecdote, error } = useAnecdotes()
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function submit(event) {
    event.preventDefault()
    if (busy || !anecdotes) return

    setBusy(true)
    const saved = await addAnecdote({
      content: content.inputProps.value.trim(),
      author: author.inputProps.value.trim(),
      info: info.inputProps.value.trim(),
    })
    if (saved) navigate('/')
    else setBusy(false)
  }

  function reset(event) {
    event.preventDefault()
    content.reset()
    author.reset()
    info.reset()
  }

  return (
    <section>
      <h2>create a new anecdote</h2>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={submit} onReset={reset}>
        <div><label>Content <input name="content" {...content.inputProps} required /></label></div>
        <div><label>Author <input name="author" {...author.inputProps} required /></label></div>
        <div><label>URL for more info <input name="info" {...info.inputProps} required /></label></div>
        <button disabled={busy || !anecdotes}>create</button>{' '}
        <button type="reset">reset</button>
      </form>
    </section>
  )
}
