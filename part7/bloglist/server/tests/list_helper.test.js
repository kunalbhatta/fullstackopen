const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
} = require('../utils/list_helper')

const blogs = [
  { title: 'Practical Testing', author: 'Asha', likes: 5 },
  { title: 'The Browser', author: 'Dev', likes: 12 },
  { title: 'Data Models', author: 'Asha', likes: 4 },
]

test('dummy returns one', () => assert.equal(dummy([]), 1))
test('likes sum correctly for empty, single-item and multi-item lists', () => {
  assert.equal(totalLikes([]), 0)
  assert.equal(totalLikes(blogs.slice(0, 1)), 5)
  assert.equal(totalLikes(blogs), 21)
})
test('favorite blog returns the complete highest-liked blog', () => {
  assert.equal(favoriteBlog([]), null)
  assert.deepEqual(favoriteBlog(blogs), blogs[1])
})
test('most blogs counts posts per author', () => {
  assert.equal(mostBlogs([]), null)
  assert.deepEqual(mostBlogs(blogs), { author: 'Asha', blogs: 2 })
})
test('most likes adds likes across each author’s posts', () => {
  assert.equal(mostLikes([]), null)
  assert.deepEqual(mostLikes(blogs), { author: 'Dev', likes: 12 })
  assert.deepEqual(mostLikes([...blogs, { author: 'Asha', likes: 4 }]), {
    author: 'Asha',
    likes: 13,
  })
})
