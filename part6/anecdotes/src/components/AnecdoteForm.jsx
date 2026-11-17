import { useState } from 'react'
import { useAnecdoteStore } from '../store'

export default function AnecdoteForm() {
  const create = useAnecdoteStore(state => state.create)
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const content = new FormData(form).get('anecdote').trim()
    if (!content || busy) return

    setBusy(true)
    try {
      if (await create(content)) form.reset()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section>
      <h2>create new</h2>
      <form onSubmit={submit}>
        <label>Anecdote <input name="anecdote" required data-testid="new" /></label>
        <button disabled={busy}>create</button>
      </form>
    </section>
  )
}
