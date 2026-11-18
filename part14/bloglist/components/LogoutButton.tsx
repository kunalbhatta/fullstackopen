'use client'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
export default function LogoutButton() {
  const [pending, setPending] = useState(false)
  async function logout() {
    if (pending) return
    setPending(true)
    try {
      await signOut({ redirect: false })
      document.cookie = 'practice_flash=Logged%20out; Path=/; Max-Age=20; SameSite=Lax'
      window.location.assign('/')
    } catch {
      setPending(false)
    }
  }
  return <button type="button" className="nav-link" onClick={logout} disabled={pending}>logout</button>
}
