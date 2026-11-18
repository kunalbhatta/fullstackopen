import { useContext, useState } from 'react'
import { AnecdotesContext } from './context'

export function useField(type) {
  const [value, setValue] = useState('')
  return {
    inputProps: { type, value, onChange: event => setValue(event.target.value) },
    reset: () => setValue(''),
  }
}

export function useAnecdotes() {
  const context = useContext(AnecdotesContext)
  if (!context) throw new Error('AnecdotesProvider is missing')
  const { anecdotes, error, addAnecdote, deleteAnecdote } = context
  return { anecdotes, error, addAnecdote, deleteAnecdote }
}
