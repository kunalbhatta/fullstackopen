import { useState } from 'react'
import { useApolloClient, useMutation } from '@apollo/client'
import { Formik, useField } from 'formik'
import { ScrollView, TextInput } from 'react-native'
import { useNavigate } from 'react-router-native'
import * as yup from 'yup'
import { AUTHENTICATE, CREATE_REVIEW, SIGN_UP, authStorage } from './api'
import { Button, Card, ErrorMessage, Label } from './ui'
import { styles } from './theme'

const credentials = { username: '', password: '' }
const loginValidation = yup.object({
  username: yup.string().trim().required('Username is required'),
  password: yup.string().required('Password is required'),
})
const registerValidation = yup.object({
  username: yup.string().trim().min(5).max(30).required('Username is required'),
  password: yup.string().min(5).max(50).required('Password is required'),
  confirmation: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm your password'),
})
const reviewValidation = yup.object({
  ownerName: yup.string().trim().required('Owner is required'),
  repositoryName: yup.string().trim().required('Repository is required'),
  rating: yup.number().typeError('Rating must be a number').integer().min(0).max(100).required('Rating is required'),
  text: yup.string(),
})

function Field({ name, label, ...props }) {
  const [field, meta, helpers] = useField(name)
  return <>
    <Label>{label}</Label>
    <TextInput
      accessibilityLabel={label}
      placeholder={label}
      value={field.value}
      onChangeText={helpers.setValue}
      onBlur={() => helpers.setTouched(true)}
      style={styles.input}
      autoCapitalize="none"
      {...props}
    />
    <ErrorMessage error={meta.touched ? meta.error : undefined} />
  </>
}

export function SignInForm({ onSubmit }) {
  return <Formik initialValues={credentials} validationSchema={loginValidation} onSubmit={onSubmit}>
    {({ handleSubmit, isSubmitting }) => <Card>
      <Label style={styles.title}>Sign in</Label>
      <Field name="username" label="Username" />
      <Field name="password" label="Password" secureTextEntry />
      <Button onPress={handleSubmit} disabled={isSubmitting}>Sign in</Button>
    </Card>}
  </Formik>
}

function useSignIn() {
  const [authenticate] = useMutation(AUTHENTICATE)
  const client = useApolloClient()
  return async ({ username, password }) => {
    const { data } = await authenticate({ variables: { credentials: { username: username.trim(), password } } })
    await authStorage.save(data.authenticate.accessToken)
    await client.resetStore()
  }
}

export function SignIn() {
  const signIn = useSignIn()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  async function submit(values) {
    setError('')
    try { await signIn(values); navigate('/') }
    catch (problem) { setError(problem.message) }
  }

  return <ScrollView><SignInForm onSubmit={submit} /><ErrorMessage error={error} /></ScrollView>
}

export function SignUp() {
  const [createUser] = useMutation(SIGN_UP)
  const signIn = useSignIn()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  async function submit({ username, password }) {
    setError('')
    try {
      await createUser({ variables: { user: { username: username.trim(), password } } })
      await signIn({ username, password })
      navigate('/')
    } catch (problem) {
      setError(problem.message)
    }
  }

  return <ScrollView><Formik initialValues={{ ...credentials, confirmation: '' }} validationSchema={registerValidation} onSubmit={submit}>
    {({ handleSubmit, isSubmitting }) => <Card>
      <Label style={styles.title}>Sign up</Label>
      <Field name="username" label="Username" />
      <Field name="password" label="Password" secureTextEntry />
      <Field name="confirmation" label="Confirm password" secureTextEntry />
      <Button onPress={handleSubmit} disabled={isSubmitting}>Sign up</Button>
      <ErrorMessage error={error} />
    </Card>}
  </Formik></ScrollView>
}

export function CreateReview() {
  const [create] = useMutation(CREATE_REVIEW)
  const client = useApolloClient()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  async function submit({ ownerName, repositoryName, rating, text }) {
    setError('')
    try {
      const { data } = await create({ variables: { review: {
        ownerName: ownerName.trim(), repositoryName: repositoryName.trim(), rating: Number(rating), text: text.trim(),
      } } })
      await client.refetchQueries({ include: ['Repositories', 'MyReviews'] })
      navigate(`/repositories/${data.createReview.repository.id}`)
    } catch (problem) {
      setError(problem.message)
    }
  }

  return <ScrollView><Formik
    initialValues={{ ownerName: '', repositoryName: '', rating: '', text: '' }}
    validationSchema={reviewValidation}
    onSubmit={submit}
  >
    {({ handleSubmit, isSubmitting }) => <Card>
      <Label style={styles.title}>Create a review</Label>
      <Field name="ownerName" label="Repository owner" />
      <Field name="repositoryName" label="Repository name" />
      <Field name="rating" label="Rating (0–100)" keyboardType="numeric" />
      <Field name="text" label="Review" multiline />
      <Button onPress={handleSubmit} disabled={isSubmitting}>Create review</Button>
      <ErrorMessage error={error} />
    </Card>}
  </Formik></ScrollView>
}
