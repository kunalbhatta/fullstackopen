const express = require('express')
const path = require('node:path')

const app = express()
const port = process.env.PORT || 5000
const publicDir = path.join(__dirname, 'dist')

app.get('/health', (_request, response) => response.send('ok'))
app.use(express.static(publicDir))
app.get('/pokemon/:name', (_request, response) => {
  response.sendFile(path.join(publicDir, 'index.html'))
})

app.listen(port, () => {
  process.stdout.write(`Server started on port ${port}\n`)
})
