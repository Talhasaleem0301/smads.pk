import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { jobCategories } from '../data/jobCategories'
import { IconArrowRight, IconMap as IconLookup } from '../components/icons'

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
  </svg>
)

export default function SearchPage() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return jobCategories
    return jobCategories.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.desc || '').toLowerCase().includes(q) ||
      (c.tag || '').toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      <div className="orb w-[500px] h-[500px] bg-amber-50 top-[-10%] right-[10%]" aria-hidden="true" />
      <Header />

      <main className="relative z-10 px-6 lg:px-16 py-14 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black mb-1.5">Search</h1>
        <p className="text-gray-500 text-sm mb-6">Find job categories that match your skills.</p>

        <div className="relative mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search job categories (e.g. TikTok, typing, assignments)..."
            className="form-input pl-12"
          />
        </div>

        {results.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {results.map((cat) => {
              const Icon = IconLookup?.[cat.iconKey]
              return (
                <Link
                  key={cat.slug}
                  to={`/jobs/${cat.slug}`}
                  className="glass-card rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:border-amber-300 transition-colors"
                >
                  {Icon && (
                    <span className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Icon />
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{cat.name}</div>
                    <div className="text-xs text-gray-400 truncate">{cat.desc}</div>
                  </div>
                  <IconArrowRight />
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-sm">No job categories match "{query}".</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
