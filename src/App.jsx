import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import CategoryDetail from './pages/CategoryDetail'
import PaymentProof from './pages/PaymentProof'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import WalletPage from './pages/WalletPage'
import SearchPage from './pages/SearchPage'
import NewsFeed from './pages/NewsFeed'
import Notifications from './pages/Notifications'
import ReviewsRatings from './pages/ReviewsRatings'
import PostJob from './pages/PostJob'
import Messages from './pages/Messages'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import FAQ from './pages/FAQ'
import Terms from './pages/Terms'
import PrivacyPolicy from './pages/PrivacyPolicy'
import HelpSupport from './pages/HelpSupport'
import NotFound from './pages/NotFound'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/jobs/:slug" element={<CategoryDetail />} />
        <Route path="/payment-proof" element={<PaymentProof />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />

        {/* Newly added proposal-sitemap pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/feed" element={<NewsFeed />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reviews" element={<ReviewsRatings />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/help" element={<HelpSupport />} />

        {/* Fallback route — real 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
