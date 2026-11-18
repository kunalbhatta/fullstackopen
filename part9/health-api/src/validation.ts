import { z } from 'zod'
import { Gender, healthRatings, visibilityOptions, weatherOptions } from './types'

const text = z.string().trim().min(1)
const date = z.iso.date()

export const patientInput = z.object({
  name: text,
  dateOfBirth: date,
  ssn: text,
  gender: z.enum(Gender),
  occupation: text,
})

const entryBase = z.object({
  date,
  specialist: text,
  description: text,
  diagnosisCodes: z.array(text).optional(),
})

const sickLeave = z.object({ startDate: date, endDate: date }).refine(
  value => value.startDate <= value.endDate,
  { message: 'Sick leave end date must be on or after the start date' },
)

export const entryInput = z.discriminatedUnion('type', [
  entryBase.extend({ type: z.literal('HealthCheck'), healthCheckRating: z.literal(healthRatings) }),
  entryBase.extend({
    type: z.literal('Hospital'),
    discharge: z.object({ date, criteria: text }),
  }).refine(entry => entry.date <= entry.discharge.date, { message: 'Discharge precedes admission' }),
  entryBase.extend({ type: z.literal('OccupationalHealthcare'), employerName: text, sickLeave: sickLeave.optional() }),
])

export const diaryInput = z.object({
  date,
  weather: z.enum(weatherOptions),
  visibility: z.enum(visibilityOptions),
  comment: z.string().trim(),
})

export function validationMessage(error: z.ZodError) {
  return error.issues.map(issue => `${issue.path.length ? issue.path.join('.') + ': ' : ''}${issue.message}`).join('. ')
}
