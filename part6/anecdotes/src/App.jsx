import { useEffect } from 'react'
import AnecdoteForm from './components/AnecdoteForm'
import AnecdoteList from './components/AnecdoteList'
import Filter from './components/Filter'
import Notification from './components/Notification'
import { useAnecdoteStore } from './store'

export default function App() {
  const load = useAnecdoteStore(state => state.load)
  useEffect(() => { load() }, [load])

  return (
    <main>
      <h2>Anecdotes</h2>
      <Notification />
      <Filter />
      <AnecdoteList />
      <AnecdoteForm />
    </main>
  )
}
