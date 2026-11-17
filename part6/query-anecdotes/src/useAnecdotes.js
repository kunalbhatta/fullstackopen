import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotify } from './NotificationContext'

const key = ['anecdotes']

async function request(path = '', method = 'GET', body) {
  const response = await fetch(`/anecdotes${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Anecdote service could not complete the request')
  return data
}

export default function useAnecdotes() {
  const client = useQueryClient()
  const { notify } = useNotify()
  const query = useQuery({ queryKey: key, queryFn: () => request(), retry: false })
  const reportError = error => notify(error.message, true)

  const addition = useMutation({
    mutationFn: content => request('', 'POST', { content }),
    onError: reportError,
    onSuccess: created => {
      client.setQueryData(key, previous => [...(previous ?? []), created])
      notify(`you created '${created.content}'`)
    },
  })

  const voting = useMutation({
    scope: { id: 'anecdote-votes' },
    mutationFn: id => {
      const current = client.getQueryData(key).find(item => item.id === id)
      return request(`/${id}`, 'PATCH', { votes: current.votes + 1 })
    },
    onError: reportError,
    onSuccess: updated => {
      client.setQueryData(key, previous => previous.map(item => item.id === updated.id ? updated : item))
      notify(`you voted '${updated.content}'`)
    },
  })

  async function create(content) {
    try {
      await addition.mutateAsync(content)
      return true
    } catch {
      return false
    }
  }

  return { query, create, creating: addition.isPending, vote: voting.mutate }
}
