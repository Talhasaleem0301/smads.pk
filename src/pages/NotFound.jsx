import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { IconArrowRight } from '../components/icons'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sora flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="text-7xl sm:text-8xl font-black text-amber-400 mb-4">404</div>
        <h1 className="text-2xl sm:text-3xl font-black mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-sm">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/" className="btn-primary w-auto py-3 px-8 inline-flex items-center gap-2 text-sm">
          Back to Home <IconArrowRight />
        </Link>
      </main>
      <Footer />
    </div>
  )
}
