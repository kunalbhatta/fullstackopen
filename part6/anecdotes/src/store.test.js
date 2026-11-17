import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from './api'
import { useAnecdoteStore, visibleAnecdotes } from './store'

vi.mock('./api', () => ({
  listAnecdotes: vi.fn(),
  updateVotes: vi.fn(),
}))

const seed = [
  { id: '1', content: 'Write clear code', votes: 3 },
  { id: '2', content: 'Practice every day', votes: 8 },
  { id: '3', content: 'Use tests to protect code', votes: 5 },
]

describe('loading and selecting anecdotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAnecdoteStore.setState({ anecdotes: [], filter: '' })
    api.listAnecdotes.mockResolvedValue(seed)
  })

  it('initializes the Zustand state with the exact backend data', async () => {
    await useAnecdoteStore.getState().load()
    expect(useAnecdoteStore.getState().anecdotes).toEqual(seed)
  })

  it('sorts the list by votes and preserves the server order in the store', async () => {
    await useAnecdoteStore.getState().load()
    const { anecdotes } = useAnecdoteStore.getState()
    expect(visibleAnecdotes(anecdotes, '').map(item => item.id)).toEqual(['2', '3', '1'])
    expect(anecdotes.map(item => item.id)).toEqual(['1', '2', '3'])
  })

  it('shows matches in sorted order and ignores case', async () => {
    await useAnecdoteStore.getState().load()
    useAnecdoteStore.getState().setFilter('CODE')
    const { anecdotes, filter } = useAnecdoteStore.getState()
    expect(visibleAnecdotes(anecdotes, filter).map(item => item.id)).toEqual(['3', '1'])
  })

  it('persists one additional vote and updates the Zustand state', async () => {
    await useAnecdoteStore.getState().load()
    api.updateVotes.mockResolvedValue({ ...seed[0], votes: 4 })
    await useAnecdoteStore.getState().vote('1')
    expect(api.updateVotes).toHaveBeenCalledWith('1', 4)
    expect(useAnecdoteStore.getState().anecdotes[0].votes).toBe(4)
  })
})
