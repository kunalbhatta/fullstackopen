'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type NotificationContextValue = { notify: (message: string) => void }
const NotificationContext = createContext<NotificationContextValue>({ notify: () => undefined })
export const useNotifications = () => useContext(NotificationContext)

export function Notifications({ children }: {children: React.ReactNode}) {
  const [message, setMessage] = useState('')
  const pathname = usePathname()

  useEffect(() => {
    // Read and clear the flash cookie after route navigation. Async scheduling
    // avoids a nested synchronous React update inside an effect.
    const timeout = setTimeout(() => {
      const entry = document.cookie.split('; ').find(part => part.startsWith('practice_flash='))
      if (!entry) return
      try { setMessage(decodeURIComponent(entry.slice('practice_flash='.length))) }
      catch { setMessage('Action completed') }
      document.cookie = 'practice_flash=; Path=/; Max-Age=0; SameSite=Lax'
    }, 0)
    return () => clearTimeout(timeout)
  }, [pathname])

  useEffect(() => {
    if (!message) return
    const timeout = setTimeout(() => setMessage(''), 7000)
    return () => clearTimeout(timeout)
  }, [message])

  return <NotificationContext.Provider value={{ notify: setMessage }}>
    {message && <div data-testid="notification" role="status"
      className="fixed right-5 top-20 z-50 max-w-md rounded-lg border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-900 shadow-lg">
      {message}
    </div>}
    {children}
  </NotificationContext.Provider>
}
