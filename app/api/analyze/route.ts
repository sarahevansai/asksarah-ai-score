import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { scrapeUrl } from '@/lib/scraper'
import { scoreUrl } from '@/lib/scorer'

const AnalyzeSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .refine(
      (val) => {
        try {
          const normalized = val.startsWith('http') ? val : `https://${val}`
          new URL(normalized)
          return true
        } catch {
          return false
        }
      },
      { message: 'Invalid URL format' }
    ),
})

// Block internal/private IPs
function isPrivateUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url.startsWith('http') ? url : `https://${url}`)
    const privatePatterns = [
      /^localhost$/i,
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^::1$/,
      /^0\.0\.0\.0/,
    ]
    return privatePatterns.some((p) => p.test(hostname))
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''

  let body: unknown
  try {
    if (contentType.includes('application/json')) {
      body = await request.json()
    } else {
      return NextResponse.json(
        { error: 'Invalid content type', message: 'Use application/json' },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', message: 'Request body must be valid JSON' },
      { status: 400 }
    )
  }

  // Validate input
  const parseResult = AnalyzeSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'Validation error',
        message: parseResult.error.errors[0]?.message || 'Invalid input',
        details: parseResult.error.errors,
      },
      { status: 422 }
    )
  }

  const { url } = parseResult.data

  // Security: block private URLs
  if (isPrivateUrl(url)) {
    return NextResponse.json(
      { error: 'Invalid URL', message: 'Cannot analyze private or local URLs' },
      { status: 400 }
    )
  }

  // Normalize URL
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`

  try {
    // Scrape the page
    const scraped = await scrapeUrl(normalizedUrl)

    // Score it
    const result = await scoreUrl(scraped)

    return NextResponse.json(
      { data: result },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Analysis error:', error)

    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred'

    // Map common errors to user-friendly messages
    let userMessage = message
    let statusCode = 500

    if (message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
      userMessage = "Couldn't reach that domain. Check the URL and try again."
      statusCode = 422
    } else if (message.includes('ECONNREFUSED')) {
      userMessage = 'Connection refused. The site may be down or blocking scrapers.'
      statusCode = 422
    } else if (message.includes('AbortError') || message.includes('timeout')) {
      userMessage = 'Page took too long to respond (>8s). Try a different URL.'
      statusCode = 408
    } else if (message.includes('HTTP 4')) {
      userMessage = `Page returned an error: ${message}. Check the URL is publicly accessible.`
      statusCode = 422
    } else if (message.includes('Not an HTML page')) {
      userMessage = 'URL does not point to an HTML page. Please enter a webpage URL.'
      statusCode = 422
    }

    return NextResponse.json(
      { error: 'Analysis failed', message: userMessage },
      { status: statusCode }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Use POST with { "url": "https://example.com" }' },
    { status: 405 }
  )
}
