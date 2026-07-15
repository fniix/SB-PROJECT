/**
 * Simple in-memory rate limiter for API routes.
 * In production, consider using Redis or a proper rate limiting service.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

/**
 * Check if a request is rate limited.
 * @param key - Unique identifier for the rate limit group (e.g., 'chatbot', 'chat')
 * @param identifier - Unique identifier for the requester (e.g., IP address, user ID)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limited, false if allowed
 */
export function isRateLimited(
  key: string,
  identifier: string,
  limit: number = 20,
  windowMs: number = 60_000
): boolean {
  if (!stores.has(key)) {
    stores.set(key, new Map())
  }
  
  const store = stores.get(key)!
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || now > entry.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs })
    return false
  }

  entry.count++
  return entry.count > limit
}

/**
 * Get the client IP from request headers.
 */
export function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Create a rate-limited JSON error response.
 */
export function rateLimitResponse(message: string = 'Too many requests. Please wait and try again.') {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': '60',
    },
  })
}
