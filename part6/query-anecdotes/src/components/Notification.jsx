import { useNotify } from '../NotificationContext'

export default function Notification() {
  const { notice } = useNotify()
  return notice && <p data-testid="notification" role={notice.error ? 'alert' : 'status'}>{notice.message}</p>
}
