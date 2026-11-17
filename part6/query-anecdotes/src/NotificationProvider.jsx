import { useCallback, useEffect, useRef, useState } from 'react'
import { NotificationContext } from './NotificationContext'

export function NotificationProvider({ children }) {
  const [notice, setNotice] = useState(null)
  const timer = useRef()

  const notify = useCallback((message, error = false) => {
    clearTimeout(timer.current)
    setNotice({ message, error })
    timer.current = setTimeout(() => setNotice(null), 5000)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return <NotificationContext.Provider value={{ notice, notify }}>{children}</NotificationContext.Provider>
}
