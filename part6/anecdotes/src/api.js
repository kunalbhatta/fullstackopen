const request = async (suffix = '', options) => {
  const response = await fetch(`/anecdotes${suffix}`, options)
  if (!response.ok) throw new Error('Anecdote service could not complete the request')
  return response.status === 204 ? undefined : response.json()
}

const write = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const listAnecdotes = () => request()
export const addAnecdote = content => request('', write('POST', { content, votes: 0 }))
export const updateVotes = (id, votes) => request(`/${id}`, write('PATCH', { votes }))
export const deleteAnecdote = id => request(`/${id}`, { method: 'DELETE' })
