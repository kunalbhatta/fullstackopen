import { useEffect } from 'react'
import { create } from 'zustand'
import * as api from './api'
import { getUser, removeUser, saveUser } from './services/persistentUser'

let noticeTimer

const useBlogStore = create((set, get) => {
  const notify = (message, error = false) => {
    window.clearTimeout(noticeTimer)
    set({ notice: { message, error } })
    noticeTimer = window.setTimeout(() => set({ notice: null }), 5000)
  }

  async function run(action) {
    if (get().busy) return false
    set({ busy: true })
    try {
      await action()
      return true
    } catch (error) {
      if (error.status === 401 && get().viewer) {
        removeUser()
        set({ viewer: null })
      }
      notify(error.message, true)
      return false
    } finally {
      set({ busy: false })
    }
  }

  const replaceBlog = (updated) =>
    set((state) => ({
      blogs: state.blogs.map((blog) =>
        blog.id === updated.id ? updated : blog,
      ),
    }))

  return {
    viewer: getUser(),
    blogs: null,
    notice: null,
    busy: false,
    load: () =>
      run(async () => {
        try {
          set({ blogs: await api.listBlogs() })
        } catch (error) {
          set({ blogs: [] })
          throw error
        }
      }),
    login: (credentials) =>
      run(async () => {
        const viewer = await api.login(credentials)
        saveUser(viewer)
        set({ viewer })
        notify(`Signed in as ${viewer.name || viewer.username}`)
      }),
    logout: () => {
      removeUser()
      set({ viewer: null })
      notify('Signed out')
    },
    create: (entry) =>
      run(async () => {
        const saved = await api.createBlog(entry, get().viewer.token)
        set((state) => ({ blogs: [...state.blogs, saved] }))
        notify(`Added “${saved.title}”`)
      }),
    like: (blog) =>
      run(async () => {
        replaceBlog(await api.likeBlog(blog, get().viewer.token))
      }),
    remove: (blog) => {
      if (!window.confirm(`Remove “${blog.title}”?`))
        return Promise.resolve(false)
      return run(async () => {
        await api.removeBlog(blog.id, get().viewer.token)
        set((state) => ({
          blogs: state.blogs.filter((entry) => entry.id !== blog.id),
        }))
        notify(`Removed “${blog.title}”`)
      })
    },
    comment: (id, text) =>
      run(async () => replaceBlog(await api.addComment(id, text))),
  }
})

export default function useBlogList() {
  const state = useBlogStore()
  const { load } = state
  useEffect(() => {
    load()
  }, [load])
  return state
}
