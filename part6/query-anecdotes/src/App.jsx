import AnecdoteForm from './components/AnecdoteForm'
import Notification from './components/Notification'
import useAnecdotes from './useAnecdotes'

export default function App() {
  const { query, create, creating, vote } = useAnecdotes()
  if (query.isPending) return <p>Loading anecdotes…</p>
  if (query.isError) return <p role="alert">anecdote service not available due to problems in server</p>

  return (
    <main>
      <h3>Anecdote app</h3>
      <Notification />
      <AnecdoteForm create={create} pending={creating} />
      {query.data.map(anecdote => (
        <article key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>has {anecdote.votes}{' '}<button type="button" onClick={() => vote(anecdote.id)}>vote</button></div>
        </article>
      ))}
    </main>
  )
}
