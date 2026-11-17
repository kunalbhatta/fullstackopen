import { useEffect, useState } from 'react'
import Todo from './Todo'

const base = import.meta.env.VITE_BACKEND_URL || '/api'

async function request(path, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === 204) return
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data
}

export default function App() {
  const [todos, setTodos] = useState(null)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let current = true
    request('/todos').then(
      data => { if (current) setTodos(data) },
      problem => { if (current) setError(problem.message) },
    )
    return () => { current = false }
  }, [])

  async function run(action) {
    if (busy) return
    setBusy(true)
    setError('')
    try { await action() }
    catch (problem) { setError(problem.message) }
    finally { setBusy(false) }
  }

  function add(event) {
    event.preventDefault()
    if (!text.trim()) return
    void run(async () => {
      const saved = await request('/todos', 'POST', { text: text.trim() })
      setTodos(items => [...items, saved])
      setText('')
    })
  }

  const toggle = todo => run(async () => {
    const updated = await request(`/todos/${todo._id}`, 'PUT', { done: !todo.done })
    setTodos(items => items.map(item => item._id === updated._id ? updated : item))
  })
  const remove = todo => run(async () => {
    await request(`/todos/${todo._id}`, 'DELETE')
    setTodos(items => items.filter(item => item._id !== todo._id))
  })

  return <main>
    <h1>Todo list</h1>
    {error && <p role="alert">{error}</p>}
    <form onSubmit={add}>
      <label>New todo <input value={text} onChange={event => setText(event.target.value)} required /></label>
      <button disabled={busy || !todos}>Add</button>
    </form>
    {todos ? <ul>{todos.map(todo => <Todo key={todo._id} todo={todo} onToggle={toggle} onDelete={remove} />)}</ul> : !error && <p>Loading todos…</p>}
  </main>
}
