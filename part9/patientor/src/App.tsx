import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom'
import type { Diagnosis, Entry, NewEntry, Patient, PublicPatient } from '../../health-api/src/types'
import { messageFor, request, send } from '../../http'
import EntryCard from './EntryCard'
import { EntryForm, PatientForm } from './PatientForms'

function PatientList() {
  const [patients, setPatients] = useState<PublicPatient[] | null>(null)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    request<PublicPatient[]>('patients', { signal: controller.signal }).then(setPatients).catch(problem => {
      if (!controller.signal.aborted) setError(messageFor(problem))
    })
    return () => controller.abort()
  }, [])

  function add(patient: Patient) {
    const { id, name, occupation, gender, dateOfBirth } = patient
    setPatients(current => [...(current ?? []), { id, name, occupation, gender, dateOfBirth }])
    setAdding(false)
  }

  return (
    <section>
      <h1>Patientor</h1>
      {error && <p role="alert">{error}</p>}
      {!patients && !error && <p>Loading patients…</p>}
      {patients && <>
        <table>
          <thead><tr><th scope="col">Patient</th><th scope="col">Gender</th><th scope="col">Occupation</th></tr></thead>
          <tbody>{patients.map(patient => (
            <tr key={patient.id}>
              <td><Link to={`/patients/${patient.id}`}>{patient.name}</Link></td>
              <td>{patient.gender}</td><td>{patient.occupation}</td>
            </tr>
          ))}</tbody>
        </table>
        {adding ? <PatientForm onAdd={add} onClose={() => setAdding(false)} /> : (
          <p><button type="button" onClick={() => setAdding(true)}>Add patient</button></p>
        )}
      </>}
    </section>
  )
}

function PatientDetails({ id }: { id: string }) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const options = { signal: controller.signal }
    Promise.all([request<Patient>(`patients/${id}`, options), request<Diagnosis[]>('diagnoses', options)]).then(
      ([record, codes]) => { setPatient(record); setDiagnoses(codes) },
      problem => { if (!controller.signal.aborted) setError(messageFor(problem)) },
    )
    return () => controller.abort()
  }, [id])

  if (error) return <p role="alert">{error}</p>
  if (!patient) return <p>Loading patient…</p>

  async function save(entry: NewEntry) {
    const saved = await send<Entry>(`patients/${id}/entries`, entry)
    setPatient(current => current && { ...current, entries: [...current.entries, saved] })
    setAdding(false)
  }

  return (
    <section>
      <h1>{patient.name}</h1>
      <dl>
        <dt>Gender</dt><dd>{patient.gender}</dd>
        <dt>Date of birth</dt><dd>{patient.dateOfBirth}</dd>
        <dt>SSN</dt><dd>{patient.ssn}</dd>
        <dt>Occupation</dt><dd>{patient.occupation}</dd>
      </dl>
      <h2>Entries</h2>
      {patient.entries.length === 0 && <p>No entries yet.</p>}
      {patient.entries.map(entry => <EntryCard key={entry.id} entry={entry} diagnoses={diagnoses} />)}
      {adding ? <EntryForm diagnoses={diagnoses} onSave={save} onClose={() => setAdding(false)} /> : (
        <button type="button" onClick={() => setAdding(true)}>Add entry</button>
      )}
    </section>
  )
}

function PatientRoute() {
  const { id } = useParams()
  if (!id) return <p>Patient not found.</p>
  return <PatientDetails key={id} id={id} />
}

export default function App() {
  return (
    <BrowserRouter>
      <main>
        <Link to="/">Patients</Link>
        <Routes>
          <Route path="/" element={<PatientList />} />
          <Route path="/patients/:id" element={<PatientRoute />} />
          <Route path="*" element={<h1>Page not found</h1>} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
