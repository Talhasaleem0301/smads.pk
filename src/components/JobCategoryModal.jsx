import { useState } from 'react'
import { jobCategories } from '../data/jobCategories'
import { jobApi } from '../lib/api'
import { IconMap } from './icons'

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

/**
 * Final popup of the post-signup flow — shown right after the payment
 * screenshot has been submitted. Lets the worker pick the one job
 * category they want to work in.
 *
 * Props:
 *  - onSelected(category): called once a category has been chosen and the
 *    application has been recorded.
 *  - onClose(): dismiss the popup without picking a category.
 */
export default function JobCategoryModal({ onSelected, onClose }) {
  const [selectedSlug, setSelectedSlug] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handlePick = async (cat) => {
    if (submitting) return
    setSelectedSlug(cat.slug)
    setSubmitting(true)
    setError('')
    try {
      await jobApi.apply(cat.slug, cat.name)
      onSelected?.(cat)
    } catch (err) {
      setError(err.message || 'Could not save your category. Please try again.')
      setSelectedSlug(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 font-sora max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-black text-gray-900 mb-1.5">Select Your Job Category</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Almost done! Choose the category you'd like to work in — you can explore others later from your profile.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {jobCategories.map((cat) => {
            const Icon = IconMap[cat.iconKey]
            const isSelected = selectedSlug === cat.slug
            return (
              <button
                key={cat.slug}
                type="button"
                disabled={submitting}
                onClick={() => handlePick(cat)}
                className={`relative text-left rounded-2xl border-2 p-4 flex items-center gap-3 transition-all disabled:cursor-not-allowed ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50 shadow-yellow-glow'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.iconBg} text-white flex items-center justify-center flex-shrink-0`}>
                  {Icon && <Icon />}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-gray-900 truncate">{cat.name}</div>
                  <div className="text-gray-400 text-[11px] truncate">{cat.rate}</div>
                </div>
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                    <IconCheck />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {error && (
          <p className="text-red-500 text-xs font-semibold mb-4 -mt-1">{error}</p>
        )}

        {submitting && (
          <p className="text-amber-600 text-xs font-semibold mb-4 -mt-1">Saving your category...</p>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-1 text-xs text-gray-400 hover:text-gray-600 font-medium"
          >
            I'll choose this later from my profile
          </button>
        )}
      </div>
    </div>
  )
}
