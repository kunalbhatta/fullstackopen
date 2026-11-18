import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { ActivityIndicator, Alert, FlatList, Platform, View } from 'react-native'
import { useNavigate } from 'react-router-native'
import { DELETE_REVIEW, MY_REVIEWS } from './api'
import { ReviewItem } from './Repositories'
import { Button, Card, ErrorMessage, Label } from './ui'
import { styles } from './theme'

export default function MyReviews() {
  const [error, setError] = useState('')
  const { data, loading, error: queryError, refetch } = useQuery(MY_REVIEWS, { fetchPolicy: 'cache-and-network' })
  const [remove, { loading: removing }] = useMutation(DELETE_REVIEW)
  const navigate = useNavigate()

  async function deleteReview(id) {
    setError('')
    try {
      const result = await remove({ variables: { id } })
      if (!result.data.deleteReview) throw new Error('The review could not be removed')
      await refetch()
    } catch (problem) {
      setError(problem.message)
    }
  }

  function confirm(id) {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this review?')) void deleteReview(id)
      return
    }
    Alert.alert('Delete review', 'Delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteReview(id) },
    ])
  }

  if (loading && !data) return <ActivityIndicator />
  return <FlatList
    data={(data?.me?.reviews.edges ?? []).map(edge => edge.node)}
    keyExtractor={item => item.id}
    ListHeaderComponent={<ErrorMessage error={queryError?.message || error} />}
    ListEmptyComponent={<Card><Label>No reviews yet.</Label></Card>}
    renderItem={({ item }) => <ReviewItem review={item} showRepository>
      <View style={styles.row}>
        <Button onPress={() => navigate(`/repositories/${item.repository.id}`)}>View repository</Button>
        <Button disabled={removing} onPress={() => confirm(item.id)}>Delete review</Button>
      </View>
    </ReviewItem>}
  />
}
