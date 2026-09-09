import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/sm-ads-logo.svg'
import { isAuthenticated } from '../lib/api'

const NAV_LINKS = [
  { label: 'Home', href: '/#top' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Services', href: '/#features' },
  { label: 'Job Categories', href: '/#job-categories' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Payment Proof', href: '/payment-proof' },
  { label: 'Contact', href: '/#contact' },
]

function NavLink({ href, children, onClick, className = '' }) {
  // Internal route (Payment Proof) vs. same-page/other-page anchor links.
  if (href.startsWith('/payment-proof')) {
    return (
      <Link to={href} onClick={onClick} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const authed = isAuthenticated()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/95 border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-3 md:py-3.5 flex items-center justify-between gap-3">
        {/* Logo — horizontal wordmark */}
        <Link to="/" className="flex items-center flex-shrink-0" aria-label="Sm Ads home">
          <img
            src={logo}
            alt="Sm Ads - Social Media Advertiser"
            className="h-8 sm:h-9 md:h-10 lg:h-11 w-auto object-contain"
          />
        </Link>

        {/* Tablet & desktop nav — always a full navbar, no hamburger */}
        <nav className="hidden md:flex items-center flex-1 min-w-0 justify-center gap-3.5 lg:gap-5 text-[11.5px] lg:text-[13px] font-semibold text-gray-600 overflow-x-auto no-scrollbar flex-nowrap px-2">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              href={link.href}
              className="relative whitespace-nowrap shrink-0 hover:text-brand-blue-900 transition-colors py-1 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-amber-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Tablet & desktop auth buttons */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
          {authed ? (
            <>
              <Link
                to="/dashboard"
                className="btn-ghost py-2 lg:py-2.5 px-3.5 lg:px-5 text-xs lg:text-sm font-semibold whitespace-nowrap"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="btn-primary w-auto py-2 lg:py-2.5 px-4 lg:px-6 text-[11px] lg:text-xs inline-flex items-center gap-1.5 lg:gap-2 shadow-yellow-glow whitespace-nowrap"
              >
                My Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="btn-ghost py-2 lg:py-2.5 px-3.5 lg:px-5 text-xs lg:text-sm font-semibold whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn-primary w-auto py-2 lg:py-2.5 px-4 lg:px-6 text-[11px] lg:text-xs inline-flex items-center gap-1.5 lg:gap-2 shadow-yellow-glow whitespace-nowrap"
              >
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile: compact CTA + hamburger */}
        <div className="flex items-center gap-2 md:hidden flex-shrink-0">
          <Link to={authed ? '/profile' : '/signup'} className="btn-primary w-auto py-2 px-4 text-xs font-bold whitespace-nowrap">
            {authed ? 'My Profile' : 'Join Now'}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:text-amber-600 hover:border-amber-300 transition-colors flex-shrink-0"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-200 bg-white ${
          open ? 'max-h-[36rem] opacity-100' : 'max-h-0 opacity-0 border-t-0'
        }`}
      >
        <div className="px-5 sm:px-8 py-5 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2.5 text-sm font-semibold text-gray-700 hover:text-amber-600 transition-colors border-b border-gray-100 last:border-0"
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to={authed ? '/dashboard' : '/signin'}
            onClick={() => setOpen(false)}
            className="btn-ghost py-2.5 mt-4 text-sm font-semibold text-center"
          >
            {authed ? 'Dashboard' : 'Sign In'}
          </Link>
        </div>
      </div>
    </header>
  )
}
