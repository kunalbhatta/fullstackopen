import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Diary, NewDiary } from '../../health-api/src/types'
import { request, send, messageFor } from '../../http'

const weather: readonly Diary['weather'][] = ['sunny', 'rainy', 'cloudy', 'stormy', 'windy']
const visibility: readonly Diary['visibility'][] = ['great', 'good', 'ok', 'poor']

function Options({ name, values }: { name: string; values: readonly string[] }) {
  return <fieldset><legend>{name}</legend>{values.map(value => (
    <label key={value} className="choice"><input type="radio" name={name} value={value} required />{value}</label>
  ))}</fieldset>
}

export default function App() {
  const [diaries, setDiaries] = useState<Diary[] | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    request<Diary[]>('diaries', { signal: controller.signal }).then(setDiaries).catch(problem => {
      if (!controller.signal.aborted) setError(messageFor(problem))
    })
    return () => controller.abort()
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fields = new FormData(form)
    const selectedWeather = weather.find(value => value === fields.get('Weather'))
    const selectedVisibility = visibility.find(value => value === fields.get('Visibility'))
    if (!selectedWeather || !selectedVisibility) return

    const diary: NewDiary = {
      date: String(fields.get('date')), weather: selectedWeather,
      visibility: selectedVisibility, comment: String(fields.get('comment')),
    }
    setSaving(true)
    setError('')
    try {
      const saved = await send<Diary>('diaries', diary)
      setDiaries(current => [...(current ?? []), saved])
      form.reset()
    } catch (problem) {
      setError(messageFor(problem))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main>
      <h1>Flight Diary</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={submit}>
        <h2>Add a diary entry</h2>
        <label>Date <input type="date" name="date" required /></label>
        <Options name="Weather" values={weather} />
        <Options name="Visibility" values={visibility} />
        <label>Comment <textarea name="comment" /></label>
        <button disabled={saving || !diaries}>Add entry</button>
      </form>
      <section aria-label="Diary entries">
        {diaries?.toSorted((first, second) => second.date.localeCompare(first.date)).map(diary => (
          <article key={diary.id}><h2>{diary.date}</h2><p>Weather: {diary.weather}</p>
            <p>Visibility: {diary.visibility}</p>{diary.comment && <p>{diary.comment}</p>}
          </article>
        ))}
      </section>
    </main>
  )
}
