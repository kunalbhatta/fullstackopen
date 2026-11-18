const dummy = () => 1
const totalLikes = (blogs) =>
  blogs.reduce((total, blog) => total + blog.likes, 0)
const favoriteBlog = (blogs) =>
  blogs.reduce(
    (favorite, blog) =>
      !favorite || blog.likes > favorite.likes ? blog : favorite,
    null,
  )

const leaderBy = (blogs, metric, points) => {
  const scores = new Map()
  for (const blog of blogs) {
    scores.set(blog.author, (scores.get(blog.author) ?? 0) + points(blog))
  }

  let leader = null
  for (const [author, score] of scores) {
    if (!leader || score > leader[metric]) leader = { author, [metric]: score }
  }
  return leader
}

const mostBlogs = (blogs) => leaderBy(blogs, 'blogs', () => 1)
const mostLikes = (blogs) => leaderBy(blogs, 'likes', (blog) => blog.likes)

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }
