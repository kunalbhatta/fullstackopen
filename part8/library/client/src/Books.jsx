import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { BOOKS, GENRES, ME } from './graphql'

function BookTable({ genre }) {
  const { data, loading, error } = useQuery(BOOKS, { variables: { genre }, fetchPolicy: 'cache-and-network' })
  if (error) return <p role="alert">{error.message}</p>
  if (!data && loading) return <p>Loading books…</p>
  if (!data?.allBooks.length) return <p>No books found.</p>

  return (
    <table>
      <thead><tr><th scope="col">Title</th><th scope="col">Author</th><th scope="col">Published</th></tr></thead>
      <tbody>{data.allBooks.map(book => (
        <tr key={book.id}><td>{book.title}</td><td>{book.author.name}</td><td>{book.published}</td></tr>
      ))}</tbody>
    </table>
  )
}

export function Books() {
  const [genre, setGenre] = useState(null)
  const { data } = useQuery(GENRES, { fetchPolicy: 'cache-and-network' })

  return (
    <section>
      <h1>Books</h1>
      <div className="genre-filter" aria-label="Filter by genre">
        <button aria-pressed={genre === null} onClick={() => setGenre(null)}>All genres</button>
        {data?.allGenres.map(value => (
          <button key={value} aria-pressed={genre === value} onClick={() => setGenre(value)}>{value}</button>
        ))}
      </div>
      <BookTable genre={genre} />
    </section>
  )
}

export function Recommendations() {
  const { data, loading, error } = useQuery(ME, { fetchPolicy: 'network-only' })
  if (error) return <p role="alert">{error.message}</p>
  if (loading) return <p>Loading recommendations…</p>
  if (!data?.me) return <p>Sign in to see recommendations.</p>

  return (
    <section>
      <h1>Recommendations</h1>
      <p>Books in your favorite genre, <strong>{data.me.favoriteGenre}</strong>.</p>
      <BookTable genre={data.me.favoriteGenre} />
    </section>
  )
}
