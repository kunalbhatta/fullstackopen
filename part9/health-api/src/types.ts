export interface Diagnosis {
  code: string
  name: string
  latin?: string
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export const healthRatings = [0, 1, 2, 3] as const
export type HealthCheckRating = typeof healthRatings[number]

interface EntryBase {
  id: string
  date: string
  specialist: string
  description: string
  diagnosisCodes?: string[]
}

export interface HospitalEntry extends EntryBase {
  type: 'Hospital'
  discharge: { date: string; criteria: string }
}

export interface OccupationalHealthcareEntry extends EntryBase {
  type: 'OccupationalHealthcare'
  employerName: string
  sickLeave?: { startDate: string; endDate: string }
}

export interface HealthCheckEntry extends EntryBase {
  type: 'HealthCheck'
  healthCheckRating: HealthCheckRating
}

export type Entry = HospitalEntry | OccupationalHealthcareEntry | HealthCheckEntry
type DistributiveOmit<T, Key extends keyof T> = T extends unknown ? Omit<T, Key> : never
export type NewEntry = DistributiveOmit<Entry, 'id'>

export interface Patient {
  id: string
  name: string
  dateOfBirth: string
  ssn: string
  gender: Gender
  occupation: string
  entries: Entry[]
}

export type PublicPatient = Omit<Patient, 'ssn' | 'entries'>
export type NewPatient = Omit<Patient, 'id' | 'entries'>

export const weatherOptions = ['sunny', 'rainy', 'cloudy', 'stormy', 'windy'] as const
export const visibilityOptions = ['great', 'good', 'ok', 'poor'] as const

export interface Diary {
  id: number
  date: string
  weather: typeof weatherOptions[number]
  visibility: typeof visibilityOptions[number]
  comment: string
}

export type NewDiary = Omit<Diary, 'id'>
