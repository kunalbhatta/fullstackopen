import { useAnecdoteStore, visibleAnecdotes } from '../store'

export default function AnecdoteList() {
  const anecdotes = useAnecdoteStore(state => state.anecdotes)
  const filter = useAnecdoteStore(state => state.filter)
  const vote = useAnecdoteStore(state => state.vote)
  const remove = useAnecdoteStore(state => state.remove)

  return visibleAnecdotes(anecdotes, filter).map(anecdote => (
    <article key={anecdote.id}>
      <div>{anecdote.content}</div>
      <div>
        has {anecdote.votes}{' '}
        <button type="button" onClick={() => vote(anecdote.id)}>vote</button>{' '}
        {anecdote.votes === 0 && <button type="button" onClick={() => remove(anecdote.id)}>delete</button>}
      </div>
    </article>
  ))
}
