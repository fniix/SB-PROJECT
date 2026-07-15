import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// ── Simple in-memory rate limiter ──
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 20 // max requests
const RATE_WINDOW = 60_000 // per 60 seconds

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

export async function POST(req: Request) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { messages, simplifiedMode } = body

  // Validate messages
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Authenticate user to provide contextual system prompt
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let userContext = 'Guest'
  let role = 'user'
  
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
    userContext = profile?.full_name || user.email || 'User'
    role = profile?.role || 'user'
  }

  const simplifiedSystemPrompt = `You are an educational assistant specializing in special needs support.
Your name is "Spark" and you are a very kind and patient friend.

Important rules:
- Use very short sentences. One sentence at a time.
- Use simple, easy to understand words.
- Use emojis frequently to help with comprehension.
- Break down explanations into numbered steps: 1️⃣ 2️⃣ 3️⃣
- Always start with encouraging words: "Great! 🌟" or "Well done! 🎉"
- If the student is incorrect, say: "Almost! 💪 Let's try again..."
- Do not give direct answers. Ask the student first so they can think.
- Responses must not exceed 100 words.
- Reply in English.`

  const standardSystemPrompt = `You are "SB Assistant", the official, friendly, and highly intelligent AI assistant for SB Project (a premium educational platform).
You are talking to: ${userContext} (Role: ${role}).
Tone: Professional, encouraging, modern, and very helpful. Use emojis naturally but don't overdo it.

- If the user is a Student: Encourage them, give study tips, explain concepts clearly like a world-class tutor. Do NOT give them direct answers to homework, but guide them to the answer.
- If the user is a Parent: Assure them about their child's progress, explain how SB Project verified tutors work, and help them navigate the platform (Wallet, Bookings, Support).
- If the user is a Tutor: Help them with teaching strategies, platform usage, and handling special needs students (ADHD, Dyslexia).
- If the user is an Admin: Provide business analysis, summarize data professionally, and offer strategic advice.

Key Platform Info:
- "SB Project" is an educational ecosystem connecting students with verified tutors.
- We support Curriculums: British, American, IB, Bahraini.
- We have specialized support for Special Needs (ADHD, Dyslexia, Autism).
- Payments are handled via Wallet Top-ups or BenefitPay.
- 15% platform commission on tutor earnings.

Respond in English. Keep it clear and professional.`

  const systemPrompt = simplifiedMode ? simplifiedSystemPrompt : standardSystemPrompt

  try {
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages,
    })

    // Try different Vercel AI stream response methods depending on version
    const anyResult = result as any
    if (typeof anyResult.toDataStreamResponse === 'function') {
      return anyResult.toDataStreamResponse()
    } else if (typeof anyResult.toTextStreamResponse === 'function') {
      return anyResult.toTextStreamResponse()
    } else {
      // Fallback to raw text stream
      return new Response(result.textStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      })
    }
  } catch (error: any) {
    console.error('AI Stream Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
