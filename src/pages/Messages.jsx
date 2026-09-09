import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { messageApi, getStoredUser, isAuthenticated } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { IconMessageCircle, IconArrowLeft } from '../components/icons'

function initialsOf(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U'
}

export default function Messages() {
  const navigate = useNavigate()
  const me = getStoredUser()
  const bottomRef = useRef(null)

  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const [startEmail, setStartEmail] = useState('')
  const [startError, setStartError] = useState('')
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signin', { replace: true })
      return
    }
    loadConversations()
  }, [navigate])

  const loadConversations = () => {
    messageApi.conversations().then((res) => setConversations(res.conversations || [])).finally(() => setLoading(false))
  }

  const openConversation = async (id) => {
    setActiveId(id)
    try {
      const res = await messageApi.getMessages(id)
      setMessages(res.messages || [])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (err) {
      setMessages([])
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeId) return
    setSending(true)
    try {
      const res = await messageApi.send(activeId, text)
      setMessages((prev) => [...prev, res.message])
      setText('')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (err) {
      // no-op
    } finally {
      setSending(false)
    }
  }

  const handleStartConversation = async (e) => {
    e.preventDefault()
    setStartError('')
    setStarting(true)
    try {
      const res = await messageApi.startConversation(startEmail)
      setStartEmail('')
      loadConversations()
      openConversation(res.conversation._id)
    } catch (err) {
      setStartError(err.message || 'Could not start conversation.')
    } finally {
      setStarting(false)
    }
  }

  const otherParticipant = (convo) => convo.participants?.find((p) => p._id !== me?.id) || convo.participants?.[0]
  const activeConvo = conversations.find((c) => c._id === activeId)

  if (!isAuthenticated()) return null

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sora relative overflow-x-hidden">
      <div className="orb w-[400px] h-[400px] bg-amber-50 top-[-10%] right-[10%]" aria-hidden="true" />
      <Header />

      <main className="relative z-10 px-6 lg:px-16 py-14 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black mb-1.5">Messages</h1>
        <p className="text-gray-500 text-sm mb-8">Private conversations between members.</p>

        <div className="glass-card rounded-2xl border border-gray-200 overflow-hidden grid sm:grid-cols-5 min-h-[28rem]">
          {/* Conversation list */}
          <div className={`sm:col-span-2 border-r border-gray-100 ${activeId ? 'hidden sm:block' : ''}`}>
            <form onSubmit={handleStartConversation} className="p-4 border-b border-gray-100 flex gap-2">
              <input
                required
                type="email"
                placeholder="Start chat by email..."
                value={startEmail}
                onChange={(e) => setStartEmail(e.target.value)}
                className="form-input text-xs py-2"
              />
              <button type="submit" disabled={starting} className="btn-primary w-auto px-3 text-xs disabled:opacity-60">
                {starting ? '...' : 'Go'}
              </button>
            </form>
            {startError && <p className="text-red-500 text-[11px] px-4 pt-2 font-semibold">{startError}</p>}

            {loading ? (
              <div className="p-6 text-gray-400 text-xs">Loading...</div>
            ) : conversations.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {conversations.map((c) => {
                  const other = otherParticipant(c)
                  return (
                    <button
                      key={c._id}
                      onClick={() => openConversation(c._id)}
                      className={`w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-amber-50/50 transition-colors ${activeId === c._id ? 'bg-amber-50/60' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-brand-blue-900 flex items-center justify-center text-xs font-black flex-shrink-0">
                        {initialsOf(other?.fullName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{other?.fullName || 'Member'}</div>
                        <div className="text-xs text-gray-400 truncate">{c.lastMessage || 'No messages yet'}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <IconMessageCircle />
                <p className="text-gray-400 text-xs mt-2">No conversations yet. Start one above by email.</p>
              </div>
            )}
          </div>

          {/* Thread */}
          <div className={`sm:col-span-3 flex flex-col ${!activeId ? 'hidden sm:flex' : ''}`}>
            {activeId ? (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <button onClick={() => setActiveId(null)} className="sm:hidden text-gray-400"><IconArrowLeft /></button>
                  <div className="text-sm font-bold text-gray-900">{otherParticipant(activeConvo)?.fullName || 'Member'}</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
                  {messages.map((m) => (
                    <div key={m._id} className={`flex ${m.sender === me?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.sender === me?.id ? 'bg-amber-400 text-brand-blue-900' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="form-input text-sm py-2.5"
                  />
                  <button type="submit" disabled={sending || !text.trim()} className="btn-primary w-auto px-5 text-xs disabled:opacity-60">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <IconMessageCircle />
                <p className="text-gray-400 text-xs mt-2">Select a conversation to start chatting.</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mt-4">
          Messages refresh when you open a conversation. Live real-time delivery (via WebSockets) is planned for a future update.
        </p>
      </main>

      <Footer />
    </div>
  )
}
