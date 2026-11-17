import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'
import { ActivityIndicator, FlatList, Image, Linking, Pressable, TextInput, View } from 'react-native'
import { useNavigate, useParams } from 'react-router-native'
import { ONE_REPOSITORY, REPOSITORIES } from './api'
import { Button, Card, ErrorMessage, Label } from './ui'
import { styles } from './theme'

export const formatCount = value => {
  const count = value ?? 0
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count)
}

export function RepositoryItem({ repository }) {
  return (
    <Card>
      <View style={styles.row}>
        {repository.ownerAvatarUrl && <Image source={{ uri: repository.ownerAvatarUrl }} style={styles.avatar} />}
        <Label style={styles.title}>{repository.fullName}</Label>
      </View>
      {repository.description && <Label style={styles.muted}>{repository.description}</Label>}
      {repository.language && <Label style={styles.label}>{repository.language}</Label>}
      <View style={styles.stats}>
        {[
          ['Stars', repository.stargazersCount], ['Forks', repository.forksCount],
          ['Reviews', repository.reviewCount], ['Rating', repository.ratingAverage],
        ].map(([label, count]) => <View style={styles.stat} key={label}><Label>{formatCount(count)}</Label><Label style={styles.muted}>{label}</Label></View>)}
      </View>
    </Card>
  )
}

export function RepositoryList({ repositories, onSelect, header }) {
  return <FlatList
    testID="repositoryList"
    data={repositories}
    keyExtractor={item => item.id}
    ListHeaderComponent={header}
    ListEmptyComponent={<Card><Label>No repositories found.</Label></Card>}
    renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => onSelect(item.id)}><RepositoryItem repository={item} /></Pressable>}
  />
}

const orders = [
  { label: 'Latest', orderBy: 'CREATED_AT', orderDirection: 'DESC' },
  { label: 'Highest rated', orderBy: 'RATING_AVERAGE', orderDirection: 'DESC' },
  { label: 'Lowest rated', orderBy: 'RATING_AVERAGE', orderDirection: 'ASC' },
]

export function Repositories() {
  const [search, setSearch] = useState('')
  const [keyword, setKeyword] = useState('')
  const [order, setOrder] = useState(orders[0])
  const navigate = useNavigate()
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(search.trim()), 400)
    return () => clearTimeout(timer)
  }, [search])

  const { data, error, loading } = useQuery(REPOSITORIES, {
    variables: { orderBy: order.orderBy, orderDirection: order.orderDirection, searchKeyword: keyword || undefined },
  })

  const header = <Card>
    <TextInput accessibilityLabel="Search repositories" placeholder="Search repositories" value={search} onChangeText={setSearch} style={styles.input} />
    <View style={[styles.row, { flexWrap: 'wrap' }]}>
      {orders.map(option => <Pressable accessibilityRole="button" accessibilityState={{ selected: option === order }} onPress={() => setOrder(option)} key={option.label}>
        <Label style={option === order ? styles.label : styles.muted}>{option.label}</Label>
      </Pressable>)}
    </View>
    {loading && <ActivityIndicator />}
    <ErrorMessage error={error?.message} />
  </Card>

  return <RepositoryList
    repositories={(data?.repositories.edges ?? []).map(edge => edge.node)}
    onSelect={id => navigate(`/repositories/${id}`)}
    header={header}
  />
}

export function ReviewItem({ review, showRepository = false, children }) {
  return <Card>
    <View style={styles.row}>
      <Label style={styles.rating}>{review.rating}</Label>
      <View style={{ flex: 1, gap: 4 }}>
        <Label style={styles.title}>{showRepository ? review.repository.fullName : review.user.username}</Label>
        <Label style={styles.muted}>{review.createdAt.slice(0, 10)}</Label>
      </View>
    </View>
    {review.text && <Label>{review.text}</Label>}
    {children}
  </Card>
}

export function RepositoryView() {
  const { id } = useParams()
  const [moreError, setMoreError] = useState('')
  const fetching = useRef(false)
  const { data, error, loading, fetchMore } = useQuery(ONE_REPOSITORY, { variables: { id, first: 5 }, fetchPolicy: 'cache-and-network' })

  const repository = data?.repository
  if (loading && !repository) return <ActivityIndicator />
  if (error || !repository) return <Card><ErrorMessage error={error?.message || 'Repository not found'} /></Card>

  async function loadMore() {
    if (fetching.current || !repository.reviews.pageInfo.hasNextPage) return
    fetching.current = true
    setMoreError('')
    try { await fetchMore({ variables: { after: repository.reviews.pageInfo.endCursor } }) }
    catch (problem) { setMoreError(problem.message) }
    finally { fetching.current = false }
  }

  return <FlatList
    data={repository.reviews.edges.map(edge => edge.node)}
    keyExtractor={item => item.id}
    onEndReached={loadMore}
    onEndReachedThreshold={0.4}
    ListHeaderComponent={<View>
      <RepositoryItem repository={repository} />
      {repository.url && <Card><Button onPress={() => Linking.openURL(repository.url).catch(problem => setMoreError(problem.message))}>Open in GitHub</Button></Card>}
    </View>}
    ListFooterComponent={<ErrorMessage error={moreError} />}
    renderItem={({ item }) => <ReviewItem review={item} />}
  />
}
