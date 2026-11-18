import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import { calculateBmi } from './bmiCalculator'
import { calculateExercises } from './exerciseCalculator'
import { app } from './index'

test('BMI uses centimeters and handles invalid inputs', () => {
  assert.equal(calculateBmi(180, 74), 'Normal range')
  assert.equal(calculateBmi(180, 91), 'Overweight')
  assert.throws(() => calculateBmi(0, 74))
})

test('exercise result includes counts, target, ratio and assessment', () => {
  assert.deepEqual(calculateExercises([3, 0, 2, 4.5, 0, 3, 1], 2), {
    periodLength: 7,
    trainingDays: 5,
    success: false,
    rating: 2,
    ratingDescription: 'not too bad but could be better',
    target: 2,
    average: 13.5 / 7,
  })
  assert.equal(calculateExercises([1, 3], 2).success, true)
  assert.throws(() => calculateExercises([], 2))
})

test('calculator API returns valid results and distinguishes missing from malformed values', async () => {
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const base = `http://127.0.0.1:${address.port}`
  const post = (body: unknown) => fetch(base + '/exercises', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  try {
    const hello = await fetch(base + '/hello')
    assert.equal(await hello.text(), 'Hello Full Stack!')
    const bmi = await fetch(base + '/bmi?height=180&weight=72')
    assert.deepEqual(await bmi.json(), { height: 180, weight: 72, bmi: 'Normal range' })
    assert.equal((await fetch(base + '/bmi?weight=72')).status, 400)
    const missing = await post({ daily_exercises: [] })
    assert.equal(missing.status, 400)
    assert.deepEqual(await missing.json(), { error: 'parameters missing' })
    const malformed = await post({ daily_exercises: ['no'], target: 2 })
    assert.equal(malformed.status, 400)
    assert.deepEqual(await malformed.json(), { error: 'malformatted parameters' })
    const valid = await post({ daily_exercises: ['1', 3], target: 2 })
    assert.equal(valid.status, 200)
    assert.deepEqual(await valid.json(), calculateExercises([1, 3], 2))
  } finally {
    server.close()
    await once(server, 'close')
  }
})
