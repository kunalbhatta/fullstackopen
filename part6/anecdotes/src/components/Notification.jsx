import { useAnecdoteStore } from '../store'

export default function Notification() {
  const message = useAnecdoteStore(state => state.notification)
  return message && <p data-testid="notification" role="status">{message}</p>
}
