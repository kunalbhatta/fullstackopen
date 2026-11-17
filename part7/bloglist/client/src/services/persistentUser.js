const storageKey = 'fullstackopen-blog-session'

export function getUser() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey))
  } catch {
    return null
  }
}

export function saveUser(user) {
  window.localStorage.setItem(storageKey, JSON.stringify(user))
}

export function removeUser() {
  window.localStorage.removeItem(storageKey)
}
