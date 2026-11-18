import { useEffect, useState } from 'react'
import service from '../services/anecdotes'
import { AnecdotesContext } from './context'

export default function AnecdotesProvider({ children }) {
  const [anecdotes, setAnecdotes] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    service.getAll(controller.signal).then(setAnecdotes).catch(error => {
      if (!controller.signal.aborted) setError(error.message)
    })
    return () => controller.abort()
  }, [])

  async function addAnecdote(values) {
    try {
      const saved = await service.createNew({ ...values, votes: 0 })
      setAnecdotes(current => current.concat(saved))
      setError('')
      return true
    } catch (error) {
      setError(error.message)
      return false
    }
  }

  async function deleteAnecdote(id) {
    try {
      await service.remove(id)
      setAnecdotes(current => current.filter(anecdote => anecdote.id !== id))
      setError('')
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <AnecdotesContext.Provider value={{ anecdotes, error, addAnecdote, deleteAnecdote }}>
      {children}
    </AnecdotesContext.Provider>
  )
}
