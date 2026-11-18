import { createContext, useContext } from 'react'

export const NotificationContext = createContext(null)

export function useNotify() {
  return useContext(NotificationContext)
}
