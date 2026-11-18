import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native'
import { RepositoryList } from './Repositories'
import { SignInForm } from './Forms'

jest.mock('react-router-native', () => ({ useNavigate: jest.fn(), useParams: jest.fn() }))

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

test('repository list renders information and abbreviates counts', () => {
  const select = jest.fn()
  render(<RepositoryList onSelect={select} repositories={[
    { id: 'a', fullName: 'test/one', description: 'First project', language: 'JS', stargazersCount: 1556, forksCount: 55, reviewCount: 10, ratingAverage: 88 },
    { id: 'b', fullName: 'test/two', description: 'Second project', language: 'TS', stargazersCount: 3, forksCount: 0, reviewCount: 2, ratingAverage: 91 },
  ]} />)
  const list = within(screen.getByTestId('repositoryList'))
  for (const value of ['test/one', 'First project', '1.6k', '55', '10', '88', 'test/two', 'Second project', '91']) {
    expect(list.getByText(value)).toBeTruthy()
  }
  fireEvent.press(list.getByText('test/two'))
  expect(select).toHaveBeenCalledWith('b')
})

test('sign-in passes credentials after validation', async () => {
  const submit = jest.fn()
  render(<SignInForm onSubmit={submit} />)
  fireEvent.changeText(screen.getByLabelText('Username'), 'practice')
  fireEvent.changeText(screen.getByLabelText('Password'), 'example-test')
  fireEvent.press(screen.getByRole('button', { name: 'Sign in' }))
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
  expect(submit.mock.calls[0][0]).toEqual({ username: 'practice', password: 'example-test' })
})

test('sign-in does not submit empty credentials', async () => {
  const submit = jest.fn()
  render(<SignInForm onSubmit={submit} />)
  fireEvent.press(screen.getByRole('button', { name: 'Sign in' }))
  expect(await screen.findByText('Username is required')).toBeTruthy()
  expect(submit).not.toHaveBeenCalled()
})
