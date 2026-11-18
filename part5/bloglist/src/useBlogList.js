import { useEffect, useRef, useState } from 'react'
import * as api from './api'

const sessionKey = 'fullstackopen-blog-session'

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(sessionKey))
  } catch {
    return null
  }
}

export default function useBlogList() {
  const [viewer, setViewer] = useState(readSession)
  const [blogs, setBlogs] = useState(null)
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)
  const noticeTimer = useRef()
  const inProgress = useRef(false)

  function notify(message, error = false) {
    window.clearTimeout(noticeTimer.current)
    setNotice({ message, error })
    noticeTimer.current = window.setTimeout(() => setNotice(null), 5000)
  }

  useEffect(() => {
    let active = true
    api.listBlogs().then(
      data => { if (active) setBlogs(data) },
      error => {
        if (!active) return
        setBlogs([])
        notify(error.message, true)
      },
    )
    return () => {
      active = false
      window.clearTimeout(noticeTimer.current)
    }
  }, [])

  async function run(action) {
    if (inProgress.current) return false
    inProgress.current = true
    setBusy(true)
    try {
      await action()
      return true
    } catch (error) {
      if (error.status === 401 && viewer) {
        localStorage.removeItem(sessionKey)
        setViewer(null)
      }
      notify(error.message, true)
      return false
    } finally {
      inProgress.current = false
      setBusy(false)
    }
  }

  const login = credentials => run(async () => {
    const user = await api.login(credentials)
    localStorage.setItem(sessionKey, JSON.stringify(user))
    setViewer(user)
    notify(`Signed in as ${user.name || user.username}`)
  })

  function logout() {
    localStorage.removeItem(sessionKey)
    setViewer(null)
    notify('Signed out')
  }

  const create = blog => run(async () => {
    const saved = await api.createBlog(blog, viewer.token)
    setBlogs(current => [...(current ?? []), saved])
    notify(`Added “${saved.title}”`)
  })

  const like = blog => run(async () => {
    const updated = await api.likeBlog(blog, viewer.token)
    setBlogs(current => current.map(entry => entry.id === updated.id ? updated : entry))
  })

  const remove = blog => {
    if (!window.confirm(`Remove “${blog.title}”?`)) return Promise.resolve(false)

    return run(async () => {
      await api.removeBlog(blog.id, viewer.token)
      setBlogs(current => current.filter(entry => entry.id !== blog.id))
      notify(`Removed “${blog.title}”`)
    })
  }

  return { viewer, blogs, notice, busy, login, logout, create, like, remove }
}
