import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

export async function POST(req: Request) {
  const { prompt } = await req.json() // The prompt contains the JSON of metricsData

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return new Response('Unauthorized', { status: 403 })

  const systemPrompt = `You are a brilliant, highly analytical AI Business Advisor for the SB Project platform (an educational tutoring service in Bahrain).
The user is the Super Admin. They have provided you with a JSON payload representing the current platform metrics.

Your task:
1. Briefly summarize the platform's health based on the numbers.
2. Identify any warning signs (e.g., high number of pending tutor verifications, low revenue, high cancellations).
3. Provide 2-3 strategic, actionable recommendations to improve the business right now.

Format your response in plain text (using simple markdown like bullet points). Keep it concise, professional, and impactful. Do not simply read out the numbers back to the admin—analyze what they mean.`

  const result = streamText({
    model: google('gemini-1.5-flash'),
    system: systemPrompt,
    prompt: `Here are the current metrics: ${prompt}`,
  })

  return result.toTextStreamResponse()
}
