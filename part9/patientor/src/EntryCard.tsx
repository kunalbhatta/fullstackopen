import type { Diagnosis, Entry } from '../../health-api/src/types'

function unexpectedEntry(entry: never): never {
  throw new Error(`Unexpected entry: ${JSON.stringify(entry)}`)
}

function Details({ entry }: { entry: Entry }) {
  switch (entry.type) {
    case 'HealthCheck':
      return <p>Health rating: {entry.healthCheckRating}</p>
    case 'Hospital':
      return <p>Discharge: {entry.discharge.date}. {entry.discharge.criteria}</p>
    case 'OccupationalHealthcare':
      return <><p>Employer: {entry.employerName}</p>{entry.sickLeave && (
        <p>Sick leave: {entry.sickLeave.startDate} to {entry.sickLeave.endDate}</p>
      )}</>
    default:
      return unexpectedEntry(entry)
  }
}

const labels: Record<Entry['type'], string> = {
  HealthCheck: 'Health check',
  Hospital: 'Hospital',
  OccupationalHealthcare: 'Occupational healthcare',
}

export default function EntryCard({ entry, diagnoses }: { entry: Entry; diagnoses: Diagnosis[] }) {
  return (
    <article>
      <h3>{entry.date} · {labels[entry.type]}</h3>
      <p>{entry.description}</p>
      {entry.diagnosisCodes?.length ? <ul>{entry.diagnosisCodes.map(code => {
        const diagnosis = diagnoses.find(value => value.code === code)
        return <li key={code}>{code}{diagnosis ? ` — ${diagnosis.name}` : ''}</li>
      })}</ul> : null}
      <Details entry={entry} />
      <p>Specialist: {entry.specialist}</p>
    </article>
  )
}
