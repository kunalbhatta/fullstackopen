import { useFeedbackStore } from '../store'

export default function Statistics() {
  const good = useFeedbackStore(state => state.good)
  const neutral = useFeedbackStore(state => state.neutral)
  const bad = useFeedbackStore(state => state.bad)
  const all = good + neutral + bad
  const average = all ? (good - bad) / all : 0
  const positive = all ? (good / all) * 100 : 0
  const rows = { good, neutral, bad, all, average, positive: `${positive} %` }

  return (
    <section>
      <h2>statistics</h2>
      <table>
        <tbody>
          {Object.entries(rows).map(([label, value]) => (
            <tr key={label}><td>{label}</td><td>{value}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
