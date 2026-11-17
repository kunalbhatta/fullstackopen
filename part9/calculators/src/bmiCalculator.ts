import { numberValue } from './numbers'

export function calculateBmi(height: number, weight: number): string {
  if (!Number.isFinite(height) || !Number.isFinite(weight) || height <= 0 || weight <= 0) {
    throw new Error('Height and weight must be positive numbers')
  }
  const bmi = weight / (height / 100) ** 2
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal range'
  if (bmi < 30) return 'Overweight'
  return 'Obesity'
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2)
    const [height, weight] = args.length ? args.map(numberValue) : [180, 74]
    if (args.length > 2 || height === undefined || weight === undefined) {
      throw new Error('Usage: calculateBmi <height-cm> <weight-kg>')
    }
    console.log(calculateBmi(height, weight))
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Invalid input')
    process.exitCode = 1
  }
}
