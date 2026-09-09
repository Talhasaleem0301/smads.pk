import { useRef, useState } from 'react'
import { paymentProofApi } from '../lib/api'

const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
  </svg>
)

const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)

const MAX_FILE_MB = 4

/**
 * Popup shown right after the registration fee is submitted. Requires the
 * worker to upload a screenshot of the payment before the account can be
 * reviewed and activated by an admin.
 *
 * Props:
 *  - paymentId: the pending Payment._id returned by paymentApi.payRegistrationFee
 *  - onSubmitted(proof): called once the screenshot has been uploaded successfully
 *  - onClose(): called if the user dismisses the popup without uploading (kept optional/soft)
 */
export default function PaymentProofModal({ paymentId, onSubmitted, onClose }) {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [fileData, setFileData] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (screenshot).')
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_FILE_MB}MB.`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setFileData(reader.result)
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!fileData) {
      setError('Please attach a screenshot of your payment first.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await paymentProofApi.submit({ paymentId, screenshotData: fileData })
      onSubmitted?.(res.proof)
    } catch (err) {
      setError(err.message || 'Could not submit your screenshot. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 font-sora">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <IconUpload />
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-1.5">Upload Payment Screenshot</h2>
        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
          To verify your registration fee, please upload a screenshot of your JazzCash payment. An admin will review it shortly.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative mb-4 rounded-2xl overflow-hidden border border-gray-200">
            <img src={preview} alt="Payment screenshot preview" className="w-full max-h-64 object-contain bg-gray-50" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 text-xs font-bold bg-white/95 hover:bg-white text-gray-700 px-3 py-1.5 rounded-full shadow border border-gray-200"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-2xl py-10 flex flex-col items-center gap-2 text-gray-400 hover:text-amber-600 transition-colors mb-4"
          >
            <IconUpload />
            <span className="text-sm font-semibold">Click to choose a screenshot</span>
            <span className="text-xs">PNG or JPG, up to {MAX_FILE_MB}MB</span>
          </button>
        )}

        {error && (
          <p className="text-red-500 text-xs font-semibold mb-4 -mt-2">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !fileData}
          className="btn-primary w-full py-3.5 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit for Review'}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 font-medium"
          >
            <IconClock /> I'll upload this later from my profile
          </button>
        )}
      </div>
    </div>
  )
}
