import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limit store
// Note: This resets on cold starts. For production at scale, use Upstash Redis.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '10')
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 min

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const cfConnecting = request.headers.get('cf-connecting-ip')

  if (cfConnecting) return cfConnecting
  if (real) return real
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const existing = rateLimitStore.get(ip)

  if (!existing || now > existing.resetAt) {
    // New window
    const resetAt = now + RATE_LIMIT_WINDOW_MS
    rateLimitStore.set(ip, { count: 1, resetAt })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt }
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count++
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - existing.count,
    resetAt: existing.resetAt,
  }
}

// Cleanup old entries periodically (prevent memory leak)
let lastCleanup = Date.now()
function maybeCleanup() {
  const now = Date.now()
  if (now - lastCleanup > 60_000) {
    // Every minute
    lastCleanup = now
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetAt) {
        rateLimitStore.delete(key)
      }
    }
  }
}

export function middleware(request: NextRequest) {
  // Only rate-limit the analyze API
  if (!request.nextUrl.pathname.startsWith('/api/analyze')) {
    return NextResponse.next()
  }

  maybeCleanup()

  const ip = getClientIP(request)
  const { allowed, remaining, resetAt } = checkRateLimit(ip)

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please wait before analyzing another URL.`,
        retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
        },
      }
    )
  }

  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)))
  return response
}

export const config = {
  matcher: '/api/analyze/:path*',
}
