import { numberValue } from './numbers'

export interface ExerciseResult {
  periodLength: number
  trainingDays: number
  success: boolean
  rating: 1 | 2 | 3
  ratingDescription: string
  target: number
  average: number
}

export function calculateExercises(hours: number[], target: number): ExerciseResult {
  if (hours.length === 0 || hours.some(value => !Number.isFinite(value) || value < 0) ||
      !Number.isFinite(target) || target <= 0) {
    throw new Error('Provide a positive target and at least one non-negative daily value')
  }

  const average = hours.reduce((sum, value) => sum + value, 0) / hours.length
  const success = average >= target
  const rating = success ? 3 : average >= 0.75 * target ? 2 : 1
  const descriptions = {
    1: 'bad',
    2: 'not too bad but could be better',
    3: 'target reached',
  }
  return {
    periodLength: hours.length, trainingDays: hours.filter(value => value > 0).length,
    success, rating, ratingDescription: descriptions[rating], target, average,
  }
}

if (require.main === module) {
  try {
    const values = process.argv.slice(2)
    const [target, ...hours] = values.length ? values.map(numberValue) : [2, 3, 0, 2, 4.5, 0, 3, 1]
    if (target === undefined || hours.some(value => value === undefined)) {
      throw new Error('Usage: calculateExercises <target> <day1> [day2 ...]')
    }
    console.log(calculateExercises(hours.filter(value => value !== undefined), target))
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Invalid input')
    process.exitCode = 1
  }
}
