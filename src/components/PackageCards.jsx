import { membershipPackages, formatPkr } from '../data/jobCategories'

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

/**
 * Renders the 3 membership/registration packages (Silver, Golden, Platinum).
 * Every package price already includes the mandatory registration fee.
 *
 * Props:
 *  - selectedKey: currently selected package key ('silver' | 'golden' | 'platinum' | null)
 *  - onSelect(pkg): called with the full package object when a card is clicked/selected
 *  - compact: smaller padding/typography — used inside the CategoryDetail sidebar
 *  - ctaLabel(pkg): optional function returning custom button text per card
 */
export default function PackageCards({ selectedKey = null, onSelect, compact = false, ctaLabel }) {
  return (
    <div className={`grid grid-cols-1 ${compact ? 'gap-4' : 'sm:grid-cols-3 gap-6'}`}>
      {membershipPackages.map((pkg) => {
        const isSelected = selectedKey === pkg.key
        return (
          <button
            type="button"
            key={pkg.key}
            onClick={() => onSelect?.(pkg)}
            className={`relative text-left rounded-3xl border-2 transition-all bg-white flex flex-col ${compact ? 'p-5' : 'p-7'} ${
              isSelected
                ? `${pkg.ring} shadow-yellow-glow scale-[1.02]`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-3 right-5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
                Most Popular
              </span>
            )}

            <div className="flex items-center justify-between mb-3">
              <div className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-[10px] font-bold ${pkg.chip}`}>
                {pkg.name} Package
              </div>
              {isSelected && (
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                  <IconCheck />
                </span>
              )}
            </div>

            <h3 className={`font-black text-gray-900 ${compact ? 'text-lg' : 'text-2xl'}`}>{pkg.name}</h3>
            <p className="text-gray-400 text-xs mb-4">{pkg.tagline}</p>

            <div className="mb-5">
              <div className={`font-black text-amber-600 ${compact ? 'text-xl' : 'text-3xl'}`}>
                {formatPkr(pkg.priceMin)} – {formatPkr(pkg.priceMax)}
              </div>
              <div className="text-[11px] text-gray-400 font-medium">One-time · registration fee included</div>
            </div>

            <ul className={`space-y-2 flex-1 ${compact ? 'mb-4' : 'mb-6'}`}>
              {pkg.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconCheck />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div
              className={`w-full text-center py-2.5 rounded-xl text-xs font-bold transition-colors ${
                isSelected
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              {ctaLabel ? ctaLabel(pkg, isSelected) : isSelected ? 'Selected' : `Choose ${pkg.name}`}
            </div>
          </button>
        )
      })}
    </div>
  )
}
