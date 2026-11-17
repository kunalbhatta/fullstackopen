import { useAnecdoteStore } from '../store'

export default function Filter() {
  const value = useAnecdoteStore(state => state.filter)
  const setFilter = useAnecdoteStore(state => state.setFilter)
  return <label>Filter <input data-testid="filter" value={value} onChange={event => setFilter(event.target.value)} /></label>
}
