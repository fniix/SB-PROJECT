'use client'

import { useState, useRef, useEffect } from 'react'

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<{ id: string, role: string, content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [simplifiedMode, setSimplifiedMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!chatInput.trim() || isLoading) return

    const userMessage = { id: Date.now().toString(), role: 'user', content: chatInput }
    setMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], simplifiedMode })
      })

      if (!response.ok) throw new Error(response.statusText)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      if (reader) {
        // Add a placeholder message for the assistant
        const assistantId = (Date.now() + 1).toString()
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          
          // Check if it's Vercel AI SDK stream format (prefixes text with 0:)
          if (chunk.includes('0:"')) {
            const lines = chunk.split('\n')
            for (const line of lines) {
              if (line.startsWith('0:')) {
                try {
                  const text = JSON.parse(line.substring(2))
                  assistantMessage += text
                } catch (e) {
                  // Ignore parsing errors for partial chunks
                }
              }
            }
          } else {
            // Raw text stream fallback
            assistantMessage += chunk
          }

          // Update the last message
          setMessages(prev => {
            const newMessages = [...prev]
            newMessages[newMessages.length - 1].content = assistantMessage
            return newMessages
          })
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 opacity-100 duration-300">
          {/* Header */}
          <div className="bg-[#0B2341] text-white px-5 py-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4A017] to-amber-300 flex items-center justify-center text-lg shadow-sm">
                ✨
              </div>
              <div>
                <h3 className="font-bold text-sm">{simplifiedMode ? '✨ Spark' : 'SB Assistant'}</h3>
                <p className="text-[10px] text-blue-200">
                  {simplifiedMode ? 'Special Needs Mode 💙' : 'Powered by AI'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Simplified Mode Toggle */}
              <button
                onClick={() => { setSimplifiedMode(m => !m); setMessages([]) }}
                title={simplifiedMode ? 'Disable Simplified Mode' : 'Enable Special Needs Mode'}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                  simplifiedMode
                    ? 'bg-blue-400 text-white border-blue-300'
                    : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                }`}
              >
                💙 {simplifiedMode ? 'Simplified' : 'Simplify'}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F9F9]">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                <span className="text-4xl">👋</span>
                <p className="text-sm font-medium text-[#0B2341]">Hi! I'm your SB Assistant.<br/>How can I help you today?</p>
              </div>
            )}
            
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user' 
                    ? 'bg-[#0B2341] text-white rounded-br-sm' 
                    : 'bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-sm'
                }`} style={{ whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </div>
              </div>
            ))}
            
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={onSubmit} className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="relative flex items-center">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-[#D4A017] focus:bg-white transition-all"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !chatInput.trim()}
                className="absolute right-1 w-8 h-8 rounded-full bg-[#D4A017] text-white flex items-center justify-center hover:bg-[#b8860b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-white text-[#0B2341] border border-gray-200 scale-90' : 'bg-[#0B2341] text-[#D4A017] hover:scale-105 hover:shadow-2xl'
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <span className="text-2xl">✨</span>
        )}
      </button>
    </div>
  )
}
