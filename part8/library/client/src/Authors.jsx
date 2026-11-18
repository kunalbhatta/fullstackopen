import { useMutation, useQuery } from '@apollo/client/react'
import { AUTHORS, EDIT_AUTHOR } from './graphql'

function EditAuthor({ authors, notify }) {
  const [update, { loading }] = useMutation(EDIT_AUTHOR)

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const name = values.get('author')
    const setBornTo = Number(values.get('born'))
    try {
      const result = await update({ variables: { name, setBornTo } })
      if (!result.data?.editAuthor) throw new Error('Author not found')
      notify(`Updated ${name}’s birth year`)
      form.reset()
    } catch (error) {
      notify(error.message, true)
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Edit birth year</h2>
      <label htmlFor="author-to-edit">Author</label>
      <select id="author-to-edit" name="author" required defaultValue="">
        <option value="" disabled>Select an author</option>
        {authors.map(author => <option key={author.id}>{author.name}</option>)}
      </select>
      <label>Birth year <input type="number" name="born" step="1" required /></label>
      <button disabled={loading}>Save birth year</button>
    </form>
  )
}

export default function Authors({ authenticated, notify }) {
  const { data, error, loading } = useQuery(AUTHORS, { fetchPolicy: 'cache-and-network' })
  if (error) return <p role="alert">{error.message}</p>
  if (!data && loading) return <p>Loading authors…</p>

  const authors = data?.allAuthors ?? []
  return (
    <section>
      <h1>Authors</h1>
      <table>
        <thead><tr><th scope="col">Name</th><th scope="col">Born</th><th scope="col">Books</th></tr></thead>
        <tbody>{authors.map(author => (
          <tr key={author.id}><td>{author.name}</td><td>{author.born ?? '—'}</td><td>{author.bookCount}</td></tr>
        ))}</tbody>
      </table>
      {authenticated && <EditAuthor authors={authors} notify={notify} />}
    </section>
  )
}
