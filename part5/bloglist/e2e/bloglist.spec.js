import { expect, test } from '@playwright/test'

const owner = { username: 'asha', name: 'Asha', password: 'sample-pass-1' }
const reader = { username: 'dev', name: 'Dev', password: 'sample-pass-2' }
const blog = { title: 'Testing Express', author: 'Asha', url: 'https://example.org/express' }

async function login(page, credentials = owner) {
  await page.getByRole('link', { name: 'Log in' }).click()
  await page.getByLabel('Username').fill(credentials.username)
  await page.getByLabel('Password').fill(credentials.password)
  await page.getByRole('button', { name: 'Log in' }).click()
}

async function seedBlog(request, values = blog) {
  const response = await request.post('/api/login', { data: owner })
  expect(response.ok()).toBeTruthy()
  const session = await response.json()
  const created = await request.post('/api/blogs', { data: values, headers: { Authorization: `Bearer ${session.token}` } })
  expect(created.status()).toBe(201)
}

test.beforeEach(async ({ request, page }) => {
  expect((await request.post('/api/testing/reset')).status()).toBe(204)
  expect((await request.post('/api/users', { data: owner })).status()).toBe(201)
  expect((await request.post('/api/users', { data: reader })).status()).toBe(201)
  await page.goto('/')
})

test('the log-in form is visible', async ({ page }) => {
  await page.getByRole('link', { name: 'Log in' }).click()
  await expect(page.getByLabel('Username')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
})

test('login succeeds and persists across reloads', async ({ page }) => {
  await login(page)
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()
})

test('login fails with an incorrect password', async ({ page }) => {
  await login(page, { ...owner, password: 'incorrect' })
  await expect(page.getByRole('alert')).toContainText('Invalid username or password')
  await expect(page.getByRole('button', { name: 'Log out' })).toHaveCount(0)
})

test('a logged-in user can create a blog and the form closes', async ({ page }) => {
  await login(page)
  await page.getByRole('link', { name: 'Create blog' }).click()
  await page.getByLabel('Title').fill(blog.title)
  await page.getByLabel('Author').fill(blog.author)
  await page.getByLabel('URL').fill(blog.url)
  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(page.getByRole('link', { name: blog.title })).toBeVisible()
  await expect(page.getByLabel('Title')).toHaveCount(0)
})

test('a blog can be liked and creator details are preserved', async ({ page, request }) => {
  await seedBlog(request)
  await page.reload()
  await login(page)
  await page.getByRole('link', { name: blog.title }).click()
  await page.getByRole('button', { name: 'Like' }).click()
  await expect(page.getByText('1 likes')).toBeVisible()
  await expect(page.getByText('Added by Asha')).toBeVisible()
})

test('the creator can remove a blog', async ({ page, request }) => {
  await seedBlog(request)
  await page.reload()
  await login(page)
  await page.getByRole('link', { name: blog.title }).click()
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Remove' }).click()
  await expect(page.getByRole('heading', { name: 'Blog List' })).toBeVisible()
  await expect(page.getByRole('link', { name: blog.title })).toHaveCount(0)
})

test('another logged-in user does not see the remove button', async ({ page, request }) => {
  await seedBlog(request)
  await page.reload()
  await login(page, reader)
  await page.getByRole('link', { name: blog.title }).click()
  await expect(page.getByRole('button', { name: 'Like' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(0)
})

test('blog list sorts by likes descending', async ({ page, request }) => {
  await seedBlog(request, { ...blog, likes: 2 })
  await seedBlog(request, { ...blog, title: 'Popular Guide', likes: 7 })
  await seedBlog(request, { ...blog, title: 'Third Post', likes: 4 })
  await page.reload()
  await login(page)
  await expect(page.getByRole('list', { name: 'Blogs' }).getByRole('link')).toHaveText(['Popular Guide', 'Third Post', blog.title])
})

test('guest can open a blog and cannot like or remove it', async ({ page, request }) => {
  await seedBlog(request)
  await page.reload()
  await page.getByRole('link', { name: blog.title }).click()
  await expect(page.getByRole('heading', { name: blog.title })).toBeVisible()
  await expect(page.getByText('0 likes')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Like' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(0)
})
