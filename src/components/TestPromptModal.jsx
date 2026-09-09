const IconClipboardCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="4" x="8" y="2" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="m9 14 2 2 4-4" />
  </svg>
)

/**
 * First popup of the post-signup flow. Shown as soon as the account has
 * been created, before the worker is sent into the fee → screenshot →
 * category chain.
 *
 * Props:
 *  - onAttempt(): called when the worker clicks "Attempt Test" — moves
 *    the flow forward to the registration fee popup.
 *  - onSkip(): called if the worker dismisses this popup (kept optional/soft,
 *    same convention as the rest of the onboarding modals).
 */
export default function TestPromptModal({ onAttempt, onSkip }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 font-sora text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5">
          <IconClipboardCheck />
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-1.5">Account Created! 🎉</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Now attempt your qualification test to get verified and start earning on Sm Ads.
        </p>

        <button
          type="button"
          onClick={onAttempt}
          className="btn-primary w-full py-3.5 text-sm font-bold"
        >
          Attempt Test
        </button>

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 font-medium"
          >
            I'll do this later from my profile
          </button>
        )}
      </div>
    </div>
  )
}
