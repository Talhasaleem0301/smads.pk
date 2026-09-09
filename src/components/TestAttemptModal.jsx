import { useMemo, useState } from 'react'
import { authApi } from '../lib/api'
import { drawRandomQuestions } from '../data/qualificationQuestions'

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
  </svg>
)

/**
 * Qualification Test attempt flow, shown from the worker's Profile page.
 * Draws 10 random MCQs from the shared 100-question bank, lets the worker
 * answer all of them, then submits the score via authApi.submitTestScore.
 *
 * Props:
 *  - onClose(): dismiss the modal without navigating away
 *  - onFinished(updatedUser): called once the score has been submitted
 */
export default function TestAttemptModal({ onClose, onFinished }) {
  // Freeze the 10 random questions for the lifetime of this attempt.
  const [questions] = useState(() => drawRandomQuestions(10))
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({}) // { [questionId]: selectedIndex }
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // { score, passed, message }

  const q = questions[current]
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === questions.length

  const score = useMemo(
    () => questions.reduce((sum, item) => sum + (answers[item.id] === item.correctIndex ? 1 : 0), 0),
    [questions, answers]
  )

  const selectAnswer = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }))
  }

  const goNext = () => setCurrent((c) => Math.min(c + 1, questions.length - 1))
  const goPrev = () => setCurrent((c) => Math.max(c - 1, 0))

  const handleSubmit = async () => {
    if (!allAnswered) {
      setError('Please answer all 10 questions before submitting.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await authApi.submitTestScore(score)
      setResult({ score, passed: score >= 6, message: res.message })
      if (onFinished) onFinished(res.user)
    } catch (err) {
      setError(err.message || 'Failed to submit your test. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-extrabold">Qualification Test</div>
            <div className="text-slate-400 text-[11px]">10 questions · need 6 correct to pass</div>
          </div>
          {!result && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300">
              <IconX />
            </button>
          )}
        </div>

        <div className="p-6">
          {result ? (
            // ── Result screen ──────────────────────────────────────────
            <div className="text-center py-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                result.passed ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
              }`}>
                {result.passed ? <IconCheck /> : <IconX />}
              </div>
              <div className={`text-xl font-black mb-1 ${result.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                {result.passed ? 'You passed!' : 'Not passed'} — {result.score}/10
              </div>
              <p className="text-gray-500 text-sm mb-6">{result.message}</p>
              <button onClick={onClose} className="btn-primary text-xs font-bold px-6 py-2.5">
                Close
              </button>
            </div>
          ) : (
            // ── Question screen ────────────────────────────────────────
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Question {current + 1} of {questions.length}
                </span>
                <span className="text-[11px] font-bold text-amber-600">{answeredCount}/{questions.length} answered</span>
              </div>

              <div className="w-full h-1.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                />
              </div>

              <h3 className="text-sm font-bold text-gray-900 mb-4 leading-relaxed">{q.question}</h3>

              <div className="space-y-2.5 mb-6">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectAnswer(i)}
                    className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-xl border transition-colors ${
                      answers[q.id] === i
                        ? 'bg-amber-50 border-amber-400 text-amber-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={current === 0}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 rounded-xl border border-gray-200 disabled:opacity-40"
                >
                  Back
                </button>

                {current < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="btn-primary text-xs font-bold px-6 py-2.5"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary text-xs font-bold px-6 py-2.5 disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit Test'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
