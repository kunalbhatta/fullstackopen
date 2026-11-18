import { useState } from 'react'
import { ApolloProvider, useApolloClient, useQuery } from '@apollo/client'
import { Pressable, ScrollView, View } from 'react-native'
import { NativeRouter, Navigate, Route, Routes, useNavigate } from 'react-router-native'
import { authStorage, client, ME } from './api'
import { CreateReview, SignIn, SignUp } from './Forms'
import MyReviews from './MyReviews'
import { Repositories, RepositoryView } from './Repositories'
import { ErrorMessage, Label } from './ui'
import { styles } from './theme'

function AppBar({ user, logout }) {
  const navigate = useNavigate()
  const links = [['Repositories', '/']]
  links.push(...(user
    ? [['Create review', '/reviews/new'], ['My reviews', '/reviews/me']]
    : [['Sign in', '/signin'], ['Sign up', '/signup']]))
  return <View style={styles.appBar}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navigation}>
      {links.map(([title, path]) => (
        <Pressable key={path} accessibilityRole="link" onPress={() => navigate(path)}><Label style={styles.navLink}>{title}</Label></Pressable>
      ))}
      {user && <Pressable accessibilityRole="button" onPress={logout}><Label style={styles.navLink}>Sign out</Label></Pressable>}
    </ScrollView>
  </View>
}

function Screens() {
  const { data, loading } = useQuery(ME)
  const user = data?.me
  const apollo = useApolloClient()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  async function logout() {
    try {
      await authStorage.remove()
      await apollo.resetStore()
      navigate('/')
    } catch (problem) {
      setError(problem.message)
    }
  }

  return <View style={styles.screen}>
    <AppBar user={user} logout={logout} />
    <ErrorMessage error={error} />
    <Routes>
      <Route path="/" element={<Repositories />} />
      <Route path="/repositories/:id" element={<RepositoryView />} />
      <Route path="/signin" element={user ? <Navigate to="/" replace /> : <SignIn />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUp />} />
      <Route path="/reviews/new" element={user ? <CreateReview /> : loading ? null : <Navigate to="/signin" replace />} />
      <Route path="/reviews/me" element={user ? <MyReviews /> : loading ? null : <Navigate to="/signin" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </View>
}

export default function App() {
  return <ApolloProvider client={client}><NativeRouter><Screens /></NativeRouter></ApolloProvider>
}
