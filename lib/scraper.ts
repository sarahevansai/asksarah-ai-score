import * as cheerio from 'cheerio'
import type { ScrapedData } from './types'

const FETCH_TIMEOUT_MS = 8000
const MAX_CONTENT_SIZE = 500_000 // 500KB max

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function normalizeUrl(url: string): string {
  let normalized = url.trim()
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized
  }
  // Remove trailing slash for consistency
  return normalized.replace(/\/$/, '')
}

function countWords(text: string): number {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length > 0).length
}

export async function scrapeUrl(inputUrl: string): Promise<ScrapedData> {
  const url = normalizeUrl(inputUrl)
  const domain = extractDomain(url)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let html = ''
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; AskSarahBot/1.0; +https://asksarah.ai/ai-score)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      throw new Error(`Not an HTML page (content-type: ${contentType})`)
    }

    const rawText = await response.text()
    html = rawText.slice(0, MAX_CONTENT_SIZE)
  } finally {
    clearTimeout(timeoutId)
  }

  const $ = cheerio.load(html)

  // Remove scripts and styles from text extraction
  $('script, style, noscript, nav, footer, header').remove()

  // ─── Meta extraction ─────────────────────────────────────────
  const title = $('title').first().text().trim() || ''
  const metaDescription =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    ''
  const metaKeywords = $('meta[name="keywords"]').attr('content') || ''
  const canonicalUrl = $('link[rel="canonical"]').attr('href') || url
  const robotsMeta = $('meta[name="robots"]').attr('content') || ''

  // Open Graph
  const ogTitle = $('meta[property="og:title"]').attr('content') || ''
  const ogDescription = $('meta[property="og:description"]').attr('content') || ''
  const ogImage = $('meta[property="og:image"]').attr('content') || ''

  // Twitter Card
  const twitterCard = $('meta[name="twitter:card"]').attr('content') || ''

  // ─── Headings ─────────────────────────────────────────────────
  const h1s: string[] = []
  const h2s: string[] = []
  const h3s: string[] = []

  $('h1').each((_, el) => { h1s.push($(el).text().trim()) })
  $('h2').each((_, el) => { h2s.push($(el).text().trim()) })
  $('h3').each((_, el) => { h3s.push($(el).text().trim()) })

  // ─── Paragraphs ───────────────────────────────────────────────
  const paragraphs: string[] = []
  $('p').each((_, el) => {
    const text = $(el).text().trim()
    if (text.length > 20) paragraphs.push(text)
  })

  // ─── Links ────────────────────────────────────────────────────
  const links: ScrapedData['links'] = []
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    const text = $(el).text().trim()
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) return
    const isExternal =
      href.startsWith('http') && !href.includes(domain)
    links.push({ href, text, isExternal })
  })

  const internalLinkCount = links.filter((l) => !l.isExternal).length
  const externalLinkCount = links.filter((l) => l.isExternal).length

  // ─── Images ───────────────────────────────────────────────────
  const images: ScrapedData['images'] = []
  $('img').each((_, el) => {
    const src = $(el).attr('src') || ''
    const alt = $(el).attr('alt') || ''
    images.push({ src, alt, hasAlt: alt.length > 0 })
  })
  const imagesWithAlt = images.filter((i) => i.hasAlt).length

  // ─── Structured Data ──────────────────────────────────────────
  const structuredData: string[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).html() || ''
    if (content.trim()) structuredData.push(content.trim())
  })

  // ─── Content signals ─────────────────────────────────────────
  const fullText = $('body').text().toLowerCase()
  const rawHtmlLower = html.toLowerCase()

  const hasFAQ =
    rawHtmlLower.includes('"@type":"faqpage"') ||
    rawHtmlLower.includes('"@type": "faqpage"') ||
    /frequently asked questions|faq/i.test(fullText)

  const hasHowTo =
    rawHtmlLower.includes('"@type":"howto"') ||
    rawHtmlLower.includes('"@type": "howto"') ||
    /how to|step-by-step|step 1/i.test(fullText)

  const hasDefinitions =
    /what is |defined as|definition of|refers to/i.test(fullText)

  const hasCitations =
    /according to|cited by|source:|references:|bibliography/i.test(fullText) ||
    externalLinkCount > 3

  const hasAuthorInfo =
    rawHtmlLower.includes('"@type":"person"') ||
    rawHtmlLower.includes('"@type": "person"') ||
    $('[rel="author"], .author, .byline, [itemprop="author"]').length > 0

  const hasDatePublished =
    rawHtmlLower.includes('datepublished') ||
    rawHtmlLower.includes('datemodified') ||
    $('time[datetime], [itemprop="datePublished"]').length > 0

  const hasTableOfContents =
    /table of contents|jump to|on this page|in this article/i.test(fullText) ||
    $('#toc, .toc, [class*="table-of-contents"]').length > 0

  // ─── Word count + reading time ────────────────────────────────
  const bodyText = $('body').text()
  const wordCount = countWords(bodyText)
  const readingTimeMin = Math.max(1, Math.round(wordCount / 250))

  // ─── Load time estimate (heuristic based on HTML size) ────────
  const htmlSizeKB = html.length / 1024
  const loadTimeEstimate = Math.round(200 + htmlSizeKB * 0.5) // rough estimate in ms

  const hasHttps = url.startsWith('https://')

  return {
    url,
    domain,
    html,
    title,
    metaDescription,
    metaKeywords,
    h1s,
    h2s,
    h3s,
    paragraphs,
    links,
    images,
    structuredData,
    hasStructuredData: structuredData.length > 0,
    canonicalUrl,
    robotsMeta,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    wordCount,
    readingTimeMin,
    hasHttps,
    hasFAQ,
    hasHowTo,
    hasDefinitions,
    hasCitations,
    hasAuthorInfo,
    hasDatePublished,
    hasTableOfContents,
    internalLinkCount,
    externalLinkCount,
    imageCount: images.length,
    imagesWithAlt,
    loadTimeEstimate,
  }
}
