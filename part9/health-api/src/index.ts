import { randomUUID } from 'node:crypto'
import express, { Router } from 'express'
import diagnostics from './data/diagnoses'
import patientSeed from './data/patients'
import diarySeed from './data/diaries.json'
import type { Diagnosis, Diary, Entry, Patient, PublicPatient } from './types'
import { diaryInput, entryInput, patientInput, validationMessage } from './validation'

type BodyRequest = express.Request<{ id?: string }, unknown, unknown>

export const app = express()
app.use(express.json())
const api = Router()
app.use('/api', api)

const diagnoses: Diagnosis[] = diagnostics
const codes = new Set(diagnoses.map(item => item.code))
const patients: Patient[] = structuredClone(patientSeed)
const diaries: Diary[] = diarySeed.map(({ id, ...fields }) => ({ id, ...diaryInput.parse(fields) }))
let nextDiaryId = Math.max(0, ...diaries.map(diary => diary.id)) + 1

const publicPatient = ({ id, name, dateOfBirth, gender, occupation }: Patient): PublicPatient => ({
  id, name, dateOfBirth, gender, occupation,
})

api.get('/ping', (_request, response) => { response.send('pong') })
api.get('/diagnoses', (_request, response) => { response.json(diagnoses) })
api.get('/patients', (_request, response) => { response.json(patients.map(publicPatient)) })
api.get('/diaries', (_request, response) => { response.json(diaries) })

api.get('/patients/:id', (request, response) => {
  const patient = patients.find(item => item.id === request.params.id)
  if (!patient) {
    response.status(404).json({ error: 'Patient not found' })
    return
  }
  response.json(patient)
})

api.post('/patients', (request: BodyRequest, response) => {
  const parsed = patientInput.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: validationMessage(parsed.error) })
    return
  }
  const patient: Patient = { ...parsed.data, id: randomUUID(), entries: [] }
  patients.push(patient)
  response.status(201).json(patient)
})

api.post('/patients/:id/entries', (request: BodyRequest, response) => {
  const patient = patients.find(item => item.id === request.params.id)
  if (!patient) {
    response.status(404).json({ error: 'Patient not found' })
    return
  }
  const parsed = entryInput.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: validationMessage(parsed.error) })
    return
  }
  if (parsed.data.diagnosisCodes?.some(code => !codes.has(code))) {
    response.status(400).json({ error: 'Unknown diagnosis code' })
    return
  }
  const entry: Entry = { ...parsed.data, id: randomUUID() }
  patient.entries.push(entry)
  response.status(201).json(entry)
})

api.get('/diaries/:id', (request, response) => {
  const diary = diaries.find(item => String(item.id) === request.params.id)
  if (!diary) {
    response.status(404).json({ error: 'Diary entry not found' })
    return
  }
  response.json(diary)
})

api.post('/diaries', (request: BodyRequest, response) => {
  const parsed = diaryInput.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: validationMessage(parsed.error) })
    return
  }
  const diary: Diary = { ...parsed.data, id: nextDiaryId++ }
  diaries.push(diary)
  response.status(201).json(diary)
})

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3001)
  app.listen(port, () => console.log(`Patientor and Flight Diary API listening on ${port}`))
}
