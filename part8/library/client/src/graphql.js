import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, gql, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

const tokenKey = 'fullstackopen-library-token'
export const storedToken = () => window.localStorage.getItem(tokenKey)
export const saveToken = value => window.localStorage.setItem(tokenKey, value)
export const clearToken = () => window.localStorage.removeItem(tokenKey)

const http = new HttpLink({ uri: '/graphql' })
const auth = new ApolloLink((operation, forward) => {
  const token = storedToken()
  operation.setContext(({ headers }) => ({
    headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) },
  }))
  return forward(operation)
})

const wsUrl = new URL('/graphql', window.location.href)
wsUrl.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
const websocket = new GraphQLWsLink(createClient({ url: wsUrl.href }))

export const client = new ApolloClient({
  link: split(({ query }) => getMainDefinition(query).operation === 'subscription', websocket, auth.concat(http)),
  cache: new InMemoryCache(),
})

const BOOK_FIELDS = gql`
  fragment BookFields on Book {
    id title published genres
    author { id name }
  }
`

export const AUTHORS = gql`query AllAuthors { allAuthors { id name born bookCount } }`
export const BOOKS = gql`
  query AllBooks($genre: String) { allBooks(genre: $genre) { ...BookFields } }
  ${BOOK_FIELDS}
`
export const GENRES = gql`query Genres { allGenres }`
export const ME = gql`query Me { me { id username favoriteGenre } }`

export const LOGIN = gql`
  mutation SignIn($username: String!, $password: String!) {
    login(username: $username, password: $password) { value }
  }
`

export const ADD_BOOK = gql`
  mutation AddBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(title: $title, author: $author, published: $published, genres: $genres) { ...BookFields }
  }
  ${BOOK_FIELDS}
`

export const EDIT_AUTHOR = gql`
  mutation EditAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) { id name born bookCount }
  }
`

export const BOOK_ADDED = gql`
  subscription OnBookAdded { bookAdded { ...BookFields } }
  ${BOOK_FIELDS}
`
