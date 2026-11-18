import { useFeedbackStore } from '../store'

const feedbackTypes = ['good', 'neutral', 'bad']

export default function Buttons() {
  const giveFeedback = useFeedbackStore(state => state.giveFeedback)
  return (
    <section>
      <h2>give feedback</h2>
      {feedbackTypes.map(kind => <button key={kind} type="button" onClick={() => giveFeedback(kind)}>{kind}</button>)}
    </section>
  )
}
