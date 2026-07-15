'use client'

import { useCompletion } from '@ai-sdk/react'
import { useState } from 'react'

export default function AdminAIAnalyst({ metricsData }: { metricsData: any }) {
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/analyze',
  })
  
  const [hasRun, setHasRun] = useState(false)

  const handleAnalyze = () => {
    setHasRun(true)
    complete(JSON.stringify(metricsData))
  }

  return (
    <div className="bg-[#0B2341] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl mt-6">
      <div className="absolute top-0 right-0 text-8xl opacity-5 translate-x-4 -translate-y-4">✨</div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4A017] to-amber-300 flex items-center justify-center text-xl shadow-sm">
              ✨
            </div>
            <div>
              <h3 className="font-black text-lg">AI Platform Analyst</h3>
              <p className="text-xs text-blue-200">Powered by Gemini 1.5 Flash</p>
            </div>
          </div>
          
          <button 
            onClick={handleAnalyze}
            disabled={isLoading}
            className="bg-[#D4A017] hover:bg-[#b8860b] text-white px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : (hasRun ? 'Refresh Analysis' : 'Run Analysis')}
          </button>
        </div>

        {hasRun && (
          <div className="mt-5 p-5 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
            {isLoading && !completion ? (
              <div className="flex items-center gap-3 text-blue-200 animate-pulse">
                <span className="text-xl">🔍</span>
                <p className="text-sm font-medium">Analyzing platform metrics and user data...</p>
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                {completion.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 text-sm text-blue-50 leading-relaxed">{line}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
