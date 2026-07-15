'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm SB Assistant 👋\nHow can I help you today?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [messages, isOpen])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply || 'Sorry, I could not respond. Please try again.' },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please check your internet and try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        data-a11y-toolbar
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #062A4F 0%, #0B3D6B 100%)' }}
        aria-label="Open SB Assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {/* Pulse indicator */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#D2A10C] animate-ping" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          data-a11y-toolbar
          className="fixed bottom-24 right-6 z-[9998] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: '360px',
            height: '500px',
            border: '1px solid rgba(6,42,79,0.15)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #062A4F 0%, #0B3D6B 100%)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: '#D2A10C' }}
            >
              SB
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-none">SB Assistant</p>
              <p className="text-white/60 text-xs mt-0.5">SB Project Support</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-green-300">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Online
            </span>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ background: '#FBF5EE' }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2 flex-shrink-0 mt-1"
                    style={{ background: '#D2A10C' }}
                  >
                    SB
                  </div>
                )}
                <div
                  className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={
                    msg.role === 'user'
                      ? {
                          background: '#062A4F',
                          color: '#ffffff',
                          borderBottomRightRadius: '4px',
                        }
                      : {
                          background: '#ffffff',
                          color: '#1a1a2e',
                          border: '1px solid rgba(6,42,79,0.1)',
                          borderBottomLeftRadius: '4px',
                        }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2 flex-shrink-0"
                  style={{ background: '#D2A10C' }}
                >
                  SB
                </div>
                <div
                  className="px-4 py-3 rounded-2xl"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(6,42,79,0.1)',
                    borderBottomLeftRadius: '4px',
                  }}
                >
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#062A4F', animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#062A4F', animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#062A4F', animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
            style={{ background: '#ffffff', borderTop: '1px solid rgba(6,42,79,0.08)' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all disabled:opacity-50"
              style={{
                background: '#F3F4F6',
                border: '1.5px solid transparent',
                color: '#062A4F',
              }}
              onFocus={e => (e.target.style.borderColor = '#D2A10C')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
              style={{ background: '#062A4F' }}
              aria-label="Send message"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div
            className="text-center py-1.5 flex-shrink-0"
            style={{ background: '#ffffff', borderTop: '1px solid rgba(6,42,79,0.05)' }}
          >
            <p className="text-[10px]" style={{ color: '#9CA3AF' }}>
              Powered by <span style={{ color: '#D2A10C', fontWeight: 600 }}>SB Project</span> × Gemini AI
            </p>
          </div>
        </div>
      )}
    </>
  )
}
