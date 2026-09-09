import { Link } from 'react-router-dom'
import logo from '../assets/sm-ads-logo-white.svg'
import { paymentMethods } from '../data/jobCategories'
import { IconFacebook, IconInstagram, IconMessageCircle, IconMailFooter } from './icons'

const QUICK_LINKS = [
  { label: 'Home', href: '/#top' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Job Categories', href: '/#job-categories' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Search Jobs', to: '/search' },
]

const SUPPORT_LINKS = [
  { label: 'Payment Proof', to: '/payment-proof' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Help Center', to: '/help' },
  { label: 'Sign In', to: '/signin' },
  { label: 'Create Account', to: '/signup' },
]

const COMPANY_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
]

export default function Footer() {
  return (
    <footer id="contact" className="relative z-10 border-t border-gray-200 bg-brand-blue-900 text-white">
      <div className="px-6 lg:px-16 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <img src={logo} alt="Sm Ads - Social Media Advertiser" className="h-10 w-auto object-contain mb-4" />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-6">
              A trusted social marketplace where verified members connect, showcase their skills and get hired for
              real freelance work — backed by a mandatory membership fee and escrow-protected payments.
            </p>
            <div className="flex items-center gap-3">
              <a href="/#contact" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-blue-900 hover:bg-amber-400 hover:border-amber-400 transition-all duration-300">
                <IconFacebook />
              </a>
              <a href="/#contact" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-blue-900 hover:bg-amber-400 hover:border-amber-400 transition-all duration-300">
                <IconInstagram />
              </a>
              <a href="/#contact" aria-label="WhatsApp" className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-blue-900 hover:bg-amber-400 hover:border-amber-400 transition-all duration-300">
                <IconMessageCircle />
              </a>
              <a href="/#contact" aria-label="Email" className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-blue-900 hover:bg-amber-400 hover:border-amber-400 transition-all duration-300">
                <IconMailFooter />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  {link.to ? (
                    <Link to={link.to} className="text-sm text-white/65 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-sm text-white/65 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-5">Support</h4>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  {link.to ? (
                    <Link to={link.to} className="text-sm text-white/65 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-sm text-white/65 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-5">Company</h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-white/65 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment methods */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-5">Payment Methods</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.name}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-white/70 text-center"
                >
                  {pm.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-white/45 text-xs">© {new Date().getFullYear()} Sm Ads. All rights reserved.</p>
          <p className="text-white/45 text-xs">Verified membership · Escrow-protected payments · 3-Day Activity Rule</p>
        </div>
      </div>
    </footer>
  )
}
