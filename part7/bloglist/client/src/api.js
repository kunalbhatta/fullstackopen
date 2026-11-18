const request = async (path, { method = 'GET', body, token } = {}) => {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`/api/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === 204) return
  const result = await response.json()
  if (!response.ok) {
    const error = new Error(result.error || 'The request failed')
    error.status = response.status
    throw error
  }
  return result
}

export const login = (credentials) =>
  request('login', { method: 'POST', body: credentials })
export const listBlogs = () => request('blogs')
export const createBlog = (blog, token) =>
  request('blogs', { method: 'POST', body: blog, token })
export const likeBlog = (blog, token) =>
  request(`blogs/${blog.id}`, {
    method: 'PUT',
    token,
    body: {
      title: blog.title,
      url: blog.url,
      author: blog.author,
      user: blog.user?.id,
      likes: blog.likes + 1,
    },
  })
export const removeBlog = (id, token) =>
  request(`blogs/${id}`, { method: 'DELETE', token })

export const listUsers = () => request('users')
export const getUser = (id) => request(`users/${id}`)
export const addComment = (id, comment) =>
  request(`blogs/${id}/comments`, {
    method: 'POST',
    body: { comment },
  })
