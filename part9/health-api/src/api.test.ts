import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import { app } from './index'
import type { Diary, Entry, Patient, PublicPatient } from './types'

test('Patientor and Flight Diary accept valid writes and reject malformed data', async () => {
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const base = `http://127.0.0.1:${address.port}/api/`
  const post = (path: string, data: unknown) => fetch(base + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  })

  try {
    assert.equal(await (await fetch(base + 'ping')).text(), 'pong')
    const list = await (await fetch(base + 'patients')).json() as PublicPatient[]
    assert.ok(list.length > 0)
    assert.ok(list.every(patient => !('ssn' in patient) && !('entries' in patient)))
    const patient = await (await fetch(base + 'patients/' + list[0].id)).json() as Patient
    assert.ok(patient.ssn)
    assert.ok(patient.entries.length > 0)

    const fields = {
      name: 'Practice Patient', dateOfBirth: '1990-06-20', ssn: 'demo-id',
      gender: 'other', occupation: 'Tester',
    }
    assert.equal((await post('patients', { ...fields, gender: 'invalid' })).status, 400)
    const created = await post('patients', fields)
    assert.equal(created.status, 201)
    const { id } = await created.json() as Patient

    const path = `patients/${id}/entries`
    const common = { date: '2025-05-13', specialist: 'Practice specialist', description: 'Exercise data' }
    const entries = [
      { ...common, type: 'HealthCheck', healthCheckRating: 1 },
      { ...common, type: 'Hospital', discharge: { date: '2025-05-14', criteria: 'Review complete' } },
      { ...common, type: 'OccupationalHealthcare', employerName: 'Practice employer' },
    ]
    for (const entry of entries) {
      const saved = await post(path, entry)
      assert.equal(saved.status, 201)
      assert.equal((await saved.json() as Entry).type, entry.type)
    }
    assert.equal((await post(path, { ...common, type: 'HealthCheck', healthCheckRating: 15 })).status, 400)
    assert.equal((await post(path, { ...common, type: 'Hospital' })).status, 400)
    const updated = await (await fetch(base + `patients/${id}`)).json() as Patient
    assert.equal(updated.entries.length, 3)

    const diary = { date: '2025-04-10', weather: 'sunny', visibility: 'good', comment: 'Practice entry' }
    assert.equal((await post('diaries', { ...diary, weather: 'unknown' })).status, 400)
    const savedDiary = await post('diaries', diary)
    assert.equal(savedDiary.status, 201)
    const record = await savedDiary.json() as Diary
    assert.equal(record.comment, diary.comment)
    assert.equal((await fetch(base + `diaries/${record.id}`)).status, 200)
  } finally {
    server.close()
    await once(server, 'close')
  }
})
