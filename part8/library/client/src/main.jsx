import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client/react'
import App from './App'
import { client } from './graphql'
import './style.css'

createRoot(document.getElementById('root')).render(<ApolloProvider client={client}><App /></ApolloProvider>)
