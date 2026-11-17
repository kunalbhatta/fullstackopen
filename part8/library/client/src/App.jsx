import { useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client/react'
import Authors from './Authors'
import { Books, Recommendations } from './Books'
import { BookForm, LoginForm } from './Forms'
import { BOOK_ADDED, clearToken, saveToken, storedToken } from './graphql'

export default function App() {
  const [page, setPage] = useState('books')
  const [authenticated, setAuthenticated] = useState(() => Boolean(storedToken()))
  const [notice, setNotice] = useState(null)
  const client = useApolloClient()
  const notify = (message, error = false) => setNotice({ message, error })

  function refreshLibrary() {
    client.refetchQueries({ include: ['AllBooks', 'AllAuthors', 'Genres'] }).catch(error => notify(error.message, true))
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const book = data.data?.bookAdded
      if (book) {
        refreshLibrary()
        notify(`New book added: ${book.title}`)
      }
    },
  })

  function login(token) {
    saveToken(token)
    setAuthenticated(true)
    setPage('books')
    notify('Signed in')
  }

  function logout() {
    clearToken()
    setAuthenticated(false)
    client.cache.evict({ fieldName: 'me' })
    setPage('books')
    notify('Signed out')
  }

  function bookAdded(book) {
    refreshLibrary()
    setPage('books')
    notify(`Added ${book.title}`)
  }

  function show(next) {
    setPage(next)
    setNotice(null)
  }

  return (
    <>
      <nav aria-label="Library">
        <button aria-pressed={page === 'books'} onClick={() => show('books')}>Books</button>
        <button aria-pressed={page === 'authors'} onClick={() => show('authors')}>Authors</button>
        {authenticated ? (
          <>
            <button aria-pressed={page === 'create'} onClick={() => show('create')}>Add a book</button>
            <button aria-pressed={page === 'recommend'} onClick={() => show('recommend')}>Recommendations</button>
            <button onClick={logout}>Log out</button>
          </>
        ) : <button aria-pressed={page === 'login'} onClick={() => show('login')}>Log in</button>}
      </nav>
      <main>
        {notice && <p className="notice" role={notice.error ? 'alert' : 'status'}>{notice.message}</p>}
        {page === 'books' && <Books />}
        {page === 'authors' && <Authors authenticated={authenticated} notify={notify} />}
        {page === 'recommend' && authenticated && <Recommendations />}
        {page === 'create' && authenticated && <BookForm onAdd={bookAdded} notify={notify} />}
        {page === 'login' && !authenticated && <LoginForm onLogin={login} notify={notify} />}
      </main>
    </>
  )
}
