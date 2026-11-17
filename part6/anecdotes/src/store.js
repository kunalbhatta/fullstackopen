import { create } from 'zustand'
import * as api from './api'

const operations = new Map()
let clearNotification

export const visibleAnecdotes = (anecdotes, filter) => (
  anecdotes.filter(anecdote => anecdote.content.toLowerCase().includes(filter.trim().toLowerCase()))
    .toSorted((first, second) => second.votes - first.votes)
)

const queue = (id, action) => {
  const previous = operations.get(id) ?? Promise.resolve()
  const next = previous.catch(() => {}).then(action)
  operations.set(id, next)
  return next.finally(() => {
    if (operations.get(id) === next) operations.delete(id)
  })
}

export const useAnecdoteStore = create((set, get) => ({
  anecdotes: [],
  filter: '',
  notification: '',
  setFilter: filter => set({ filter }),

  notify(message) {
    clearTimeout(clearNotification)
    set({ notification: message })
    clearNotification = setTimeout(() => set({ notification: '' }), 5000)
  },

  async load() {
    try {
      set({ anecdotes: await api.listAnecdotes() })
    } catch (error) {
      get().notify(error.message)
    }
  },

  async create(content) {
    try {
      const created = await api.addAnecdote(content)
      set(state => ({ anecdotes: [...state.anecdotes, created] }))
      get().notify(`you created '${created.content}'`)
      return true
    } catch (error) {
      get().notify(error.message)
      return false
    }
  },

  vote: id => queue(id, async () => {
    const anecdote = get().anecdotes.find(item => item.id === id)
    if (!anecdote) return

    try {
      const updated = await api.updateVotes(id, anecdote.votes + 1)
      set(state => ({ anecdotes: state.anecdotes.map(item => item.id === id ? updated : item) }))
      get().notify(`you voted '${updated.content}'`)
    } catch (error) {
      get().notify(error.message)
    }
  }),

  remove: id => queue(id, async () => {
    const anecdote = get().anecdotes.find(item => item.id === id)
    if (anecdote?.votes !== 0) return

    try {
      await api.deleteAnecdote(id)
      set(state => ({ anecdotes: state.anecdotes.filter(item => item.id !== id) }))
    } catch (error) {
      get().notify(error.message)
    }
  }),
}))
