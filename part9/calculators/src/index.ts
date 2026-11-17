import express from 'express'
import { calculateBmi } from './bmiCalculator'
import { calculateExercises } from './exerciseCalculator'
import { numberValue } from './numbers'

export const app = express()
app.use(express.json())

app.get('/hello', (_request, response) => {
  response.send('Hello Full Stack!')
})

app.get('/bmi', (request, response) => {
  const height = numberValue(request.query.height)
  const weight = numberValue(request.query.weight)
  if (height === undefined || weight === undefined || height <= 0 || weight <= 0) {
    response.status(400).json({ error: 'malformatted parameters' })
    return
  }
  response.json({ weight, height, bmi: calculateBmi(height, weight) })
})

app.post('/exercises', (request: express.Request<unknown, unknown, unknown>, response) => {
  const body = request.body
  if (!body || typeof body !== 'object' || !('daily_exercises' in body) || !('target' in body)) {
    response.status(400).json({ error: 'parameters missing' })
    return
  }
  const target = numberValue(body.target)
  const hours = Array.isArray(body.daily_exercises) ? body.daily_exercises.map(numberValue) : []
  if (!hours.length || hours.some(value => value === undefined || value < 0) ||
      target === undefined || target <= 0) {
    response.status(400).json({ error: 'malformatted parameters' })
    return
  }
  response.json(calculateExercises(hours.filter(value => value !== undefined), target))
})

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3003)
  app.listen(port, () => console.log(`Calculators API listening on ${port}`))
}
