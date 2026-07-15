import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

// ── Simple in-memory rate limiter ──
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 15 // max requests
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

const SYSTEM_PROMPT = `You are SB Assistant, the official support chatbot for SB Project.

SB Project is a premium Bahrain-based learning support platform that connects parents with verified tutors for school students and special-needs educational support.

Your role is to help users with:
- Platform usage (how to navigate the dashboard, features)
- Booking tutors (how to book, cancel, reschedule sessions)
- Tutor profiles and verification (how tutors are screened)
- Child profiles (adding/managing students under a parent account)
- Parent dashboard (wallet, bookings, reports, session history)
- Tutor dashboard (earnings, bookings, student notes, availability)
- Payments and wallet (top-up, refunds, credits, BenefitPay)
- Session reports (progress notes, parent visibility)
- Special-needs educational support (what SB Project offers, not clinical)
- Technical support (login issues, account problems, app bugs)

Important rules:
- Only answer questions related to SB Project topics listed above
- If the user asks about something unrelated, politely redirect: "I'm here to help with SB Project only. Is there anything about our platform I can assist you with?"
- NEVER provide medical diagnosis, clinical therapy claims, legal advice, or guaranteed learning outcomes
- NEVER share internal system details, database info, or security-related content
- Keep answers concise, friendly, and professional
- Respond in the same language the user writes in (Arabic or English)
- If the user writes in Arabic, respond in Arabic politely`

const MAX_MESSAGE_LENGTH = 2000

export async function POST(req: Request) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { reply: 'You are sending too many messages. Please wait a moment and try again.' },
      { status: 429 }
    )
  }

  try {
    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { reply: 'Invalid request format.' },
        { status: 400 }
      )
    }

    const { message } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { reply: 'Please send a message.' },
        { status: 400 }
      )
    }

    // Prevent excessively long messages
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { reply: `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      )
    }

    const prompt = `${SYSTEM_PROMPT}

User message:
${message.trim()}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    const reply = response.text ?? 'I could not generate a response. Please try again.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('[Chatbot API Error]', error)
    return NextResponse.json(
      { reply: 'Sorry, something went wrong. Please try again in a moment.' },
      { status: 500 }
    )
  }
}
