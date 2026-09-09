import { useState } from 'react'
import { paymentApi } from '../lib/api'
import { paymentMethods } from '../data/jobCategories'

const IconWallet = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)

const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" />
  </svg>
)

/**
 * Second popup of the post-signup flow — shown right after the worker
 * clicks "Attempt Test". Asks them to submit the PKR 500 registration fee
 * before they can move on to the screenshot-upload popup.
 *
 * Props:
 *  - onPaid(paymentId): called once the fee has been recorded, with the
 *    pending Payment id to hand off to PaymentProofModal.
 *  - onClose(): dismiss the popup without submitting.
 */
export default function RegistrationFeeModal({ onPaid, onClose }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await paymentApi.payRegistrationFee({
        gateway: 'JAZZCASH',
        accountNumber: paymentMethods[0]?.account || '',
        amount: 500,
      })
      onPaid?.(res.receipt.paymentId)
    } catch (err) {
      setError(err.message || 'Could not record your payment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 font-sora">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <IconWallet />
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-1.5">Submit Your Fee — PKR 500</h2>
        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
          Before your qualification test unlocks, send the one-time PKR 500 registration fee to the account below.
        </p>

        <div className="space-y-3 mb-5">
          {paymentMethods.map((pm) => (
            <div key={pm.name} className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-gray-900">{pm.name}</span>
                <span className="w-8 h-8 rounded-lg bg-white text-amber-600 flex items-center justify-center border border-amber-200"><IconPhone /></span>
              </div>
              <div className="text-amber-600 font-mono font-bold text-base mb-1 break-all">{pm.account}</div>
              <div className="text-gray-400 text-xs mb-2">{pm.accountTitle}</div>
              <div className="text-gray-500 text-[11px] leading-relaxed">{pm.note}</div>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-xs font-semibold mb-4 -mt-2">{error}</p>
        )}

        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="btn-primary w-full py-3.5 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Recording Payment...' : "I've Sent PKR 500"}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 font-medium"
          >
            I'll pay this later from my profile
          </button>
        )}
      </div>
    </div>
  )
}
