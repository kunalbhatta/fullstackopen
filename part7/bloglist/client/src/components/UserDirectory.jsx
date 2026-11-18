import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { listUsers, getUser } from '../api'
import { Panel } from '../styles'

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  th,
  td {
    padding: 0.7rem;
    border-bottom: 1px solid #d4e2d9;
  }
`

function DirectoryPage({ id }) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const promise = id ? getUser(id) : listUsers()
    promise.then(
      (data) => {
        if (active) setResult(data)
      },
      (problem) => {
        if (active) setError(problem.message)
      },
    )
    return () => {
      active = false
    }
  }, [id])

  if (error) return <p role="alert">{error}</p>
  if (!result) return <p>Loading users…</p>

  if (id) {
    const user = result
    return (
      <Panel>
        <h1>{user.name || user.username}</h1>
        <h2>Added blogs</h2>
        {user.blogs.length === 0 ? (
          <p>No blogs yet.</p>
        ) : (
          <ul>
            {user.blogs.map((blog) => (
              <li key={blog.id}>
                <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    )
  }

  return (
    <Panel>
      <h1>Users</h1>
      <UserTable>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Blogs created</th>
          </tr>
        </thead>
        <tbody>
          {result.map((user) => (
            <tr key={user.id}>
              <td>
                <Link to={`/users/${user.id}`}>
                  {user.name || user.username}
                </Link>
              </td>
              <td>{user.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </UserTable>
    </Panel>
  )
}

export default function UserDirectory() {
  const { id } = useParams()
  return <DirectoryPage key={id ?? 'all'} id={id} />
}
