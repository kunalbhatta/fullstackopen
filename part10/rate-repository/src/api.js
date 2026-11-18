import AsyncStorage from '@react-native-async-storage/async-storage'
import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { relayStylePagination } from '@apollo/client/utilities'

const key = 'repository-access-token'
export const authStorage = {
  get: () => AsyncStorage.getItem(key),
  save: token => AsyncStorage.setItem(key, token),
  remove: () => AsyncStorage.removeItem(key),
}

const transport = new HttpLink({
  uri: process.env.EXPO_PUBLIC_APOLLO_URI || 'http://localhost:4000/',
})
const authorization = setContext(async (_, { headers }) => {
  const token = await authStorage.get()
  return { headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) } }
})

export const client = new ApolloClient({
  link: authorization.concat(transport),
  cache: new InMemoryCache({
    typePolicies: { Repository: { fields: { reviews: relayStylePagination() } } },
  }),
})

const REPOSITORY = gql`
  fragment RepositoryFields on Repository {
    id fullName description language ownerAvatarUrl
    stargazersCount forksCount reviewCount ratingAverage url
  }
`
const REVIEW = gql`
  fragment ReviewFields on Review { id rating text createdAt user { id username } }
`
export const REPOSITORIES = gql`
  query Repositories($orderBy: AllRepositoriesOrderBy!, $orderDirection: OrderDirection!, $searchKeyword: String) {
    repositories(orderBy: $orderBy, orderDirection: $orderDirection, searchKeyword: $searchKeyword) {
      edges { node { ...RepositoryFields } }
    }
  }
  ${REPOSITORY}
`
export const ONE_REPOSITORY = gql`
  query Repository($id: ID!, $first: Int!, $after: String) {
    repository(id: $id) {
      ...RepositoryFields
      reviews(first: $first, after: $after) {
        edges { cursor node { ...ReviewFields } }
        pageInfo { endCursor hasNextPage }
      }
    }
  }
  ${REPOSITORY}
  ${REVIEW}
`
export const ME = gql`query CurrentUser { me { id username } }`
export const MY_REVIEWS = gql`
  query MyReviews {
    me {
      id
      reviews {
        edges { node { ...ReviewFields repository { id fullName } } }
      }
    }
  }
  ${REVIEW}
`
export const AUTHENTICATE = gql`
  mutation Authenticate($credentials: AuthenticateInput!) {
    authenticate(credentials: $credentials) { accessToken }
  }
`
export const SIGN_UP = gql`
  mutation CreateUser($user: CreateUserInput!) { createUser(user: $user) { id username } }
`
export const CREATE_REVIEW = gql`
  mutation ReviewRepository($review: CreateReviewInput!) {
    createReview(review: $review) { id repository { id } }
  }
`
export const DELETE_REVIEW = gql`mutation DeleteReview($id: ID!) { deleteReview(id: $id) }`
