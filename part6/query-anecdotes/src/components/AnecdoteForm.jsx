export default function AnecdoteForm({ create, pending }) {
  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const content = new FormData(form).get('anecdote').trim()
    if (await create(content)) form.reset()
  }

  return (
    <form onSubmit={submit}>
      <label>Anecdote <input name="anecdote" required /></label>
      <button disabled={pending}>create</button>
    </form>
  )
}
