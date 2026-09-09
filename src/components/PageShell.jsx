import Header from './Header'
import Footer from './Footer'

/**
 * Shared shell for lightweight content pages (About, Contact, FAQ, Terms,
 * Privacy, Help, 404). Keeps the site's header/footer + hero pattern
 * consistent without repeating the boilerplate in every page.
 */
export default function PageShell({ eyebrow, title, subtitle, children, maxWidth = 'max-w-4xl' }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      <div className="orb w-[500px] h-[500px] bg-amber-50 top-[-10%] right-[10%]" aria-hidden="true" />
      <div className="orb w-[400px] h-[400px] bg-blue-600/10 bottom-[5%] left-[-10%]" aria-hidden="true" />

      <Header />

      <main className={`relative z-10 px-6 lg:px-16 py-16 sm:py-20 ${maxWidth} mx-auto`}>
        {eyebrow && (
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1 mb-4 text-amber-600 text-xs font-bold uppercase tracking-wider">
            {eyebrow}
          </div>
        )}
        {title && <h1 className="text-3xl sm:text-4xl font-black mb-3">{title}</h1>}
        {subtitle && <p className="text-gray-500 text-sm sm:text-base max-w-2xl mb-10 leading-relaxed">{subtitle}</p>}
        {children}
      </main>

      <Footer />
    </div>
  )
}
