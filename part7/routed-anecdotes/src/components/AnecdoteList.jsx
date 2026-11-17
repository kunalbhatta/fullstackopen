import { useAnecdotes } from '../hooks'

export default function AnecdoteList() {
  const { anecdotes, deleteAnecdote, error } = useAnecdotes()
  if (error && !anecdotes) return <p role="alert">{error}</p>
  if (!anecdotes) return <p>Loading anecdotes…</p>

  return (
    <section>
      <h2>Anecdotes</h2>
      {error && <p role="alert">{error}</p>}
      <ul>{anecdotes.map(anecdote => (
        <li key={anecdote.id}>
          {anecdote.content}{' '}
          <button type="button" onClick={() => deleteAnecdote(anecdote.id)}>delete</button>
        </li>
      ))}</ul>
    </section>
  )
}
