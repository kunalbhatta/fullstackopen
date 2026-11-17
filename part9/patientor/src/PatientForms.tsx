import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Diagnosis, NewEntry, Patient } from '../../health-api/src/types'
import { messageFor, send } from '../../http'

const read = (fields: FormData, name: string) => String(fields.get(name) ?? '').trim()

export function PatientForm({ onAdd, onClose }: { onAdd: (patient: Patient) => void; onClose: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget))
      onAdd(await send<Patient>('patients', values))
    } catch (problem) {
      setError(messageFor(problem))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Add a patient</h2>
      {error && <p role="alert">{error}</p>}
      <label>Name <input name="name" required /></label>
      <label>Date of birth <input name="dateOfBirth" type="date" required /></label>
      <label>SSN <input name="ssn" required /></label>
      <label>Occupation <input name="occupation" required /></label>
      <label htmlFor="gender">Gender</label>
      <select id="gender" name="gender" defaultValue="" required>
        <option value="" disabled>Select gender</option>
        <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
      </select>
      <div><button disabled={saving}>Save patient</button> <button type="button" onClick={onClose}>Cancel</button></div>
    </form>
  )
}

const entryKinds = ['HealthCheck', 'Hospital', 'OccupationalHealthcare'] as const
const ratings = [0, 1, 2, 3] as const

function entryFrom(fields: FormData, type: NewEntry['type']): NewEntry {
  const base = {
    date: read(fields, 'date'),
    specialist: read(fields, 'specialist'),
    description: read(fields, 'description'),
    diagnosisCodes: fields.getAll('diagnosisCodes').map(String),
  }
  switch (type) {
    case 'HealthCheck': {
      const healthCheckRating = ratings.find(value => String(value) === fields.get('rating'))
      if (healthCheckRating === undefined) throw new Error('Choose a health rating')
      return { ...base, type, healthCheckRating }
    }
    case 'Hospital':
      return { ...base, type, discharge: { date: read(fields, 'discharged'), criteria: read(fields, 'criteria') } }
    case 'OccupationalHealthcare': {
      const startDate = read(fields, 'startDate')
      const endDate = read(fields, 'endDate')
      return { ...base, type, employerName: read(fields, 'employerName'),
        ...(startDate || endDate ? { sickLeave: { startDate, endDate } } : {}) }
    }
  }
}

export function EntryForm({ diagnoses, onSave, onClose }: {
  diagnoses: Diagnosis[]
  onSave: (entry: NewEntry) => Promise<void>
  onClose: () => void
}) {
  const [type, setType] = useState<NewEntry['type']>('HealthCheck')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(entryFrom(new FormData(event.currentTarget), type))
    } catch (problem) {
      setError(messageFor(problem))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Add an entry</h2>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="entry-type">Entry type</label>
      <select id="entry-type" value={type} onChange={event => {
        const match = entryKinds.find(kind => kind === event.target.value)
        if (match) setType(match)
      }}>
        <option value="HealthCheck">Health check</option>
        <option value="Hospital">Hospital</option>
        <option value="OccupationalHealthcare">Occupational healthcare</option>
      </select>
      <label>Date <input name="date" type="date" required /></label>
      <label>Specialist <input name="specialist" required /></label>
      <label>Description <textarea name="description" required /></label>
      <label htmlFor="diagnosis-codes">Diagnosis codes</label>
      <select id="diagnosis-codes" name="diagnosisCodes" multiple size={5}>
        {diagnoses.map(diagnosis => <option key={diagnosis.code} value={diagnosis.code}>{diagnosis.code} — {diagnosis.name}</option>)}
      </select>
      {type === 'HealthCheck' && <>
        <label htmlFor="rating">Health rating</label>
        <select id="rating" name="rating" defaultValue="0">{ratings.map(value => <option key={value}>{value}</option>)}</select>
      </>}
      {type === 'Hospital' && <>
        <label>Discharge date <input name="discharged" type="date" required /></label>
        <label>Discharge criteria <input name="criteria" required /></label>
      </>}
      {type === 'OccupationalHealthcare' && <>
        <label>Employer <input name="employerName" required /></label>
        <label>Sick leave start <input name="startDate" type="date" /></label>
        <label>Sick leave end <input name="endDate" type="date" /></label>
      </>}
      <div><button disabled={saving}>Save entry</button> <button type="button" onClick={onClose}>Cancel</button></div>
    </form>
  )
}
