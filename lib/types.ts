// ─── Core Types ─────────────────────────────────────────────────────────────

export interface AnalysisRequest {
  url: string
}

export interface MetricScore {
  id: string
  name: string
  score: number // 0-100
  weight: number // percentage weight in total score
  status: 'excellent' | 'good' | 'fair' | 'poor'
  description: string
  detail: string
  recommendation: string
  found: boolean
}

export interface AnalysisResult {
  url: string
  domain: string
  analyzedAt: string
  totalScore: number
  scoreLabel: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  metrics: MetricScore[]
  summary: {
    strengths: string[]
    weaknesses: string[]
    topAction: string
  }
  estimatedDA: number
  pageTitle: string
  metaDescription: string
  processingTimeMs: number
}

export interface ScrapedData {
  url: string
  domain: string
  html: string
  title: string
  metaDescription: string
  metaKeywords: string
  h1s: string[]
  h2s: string[]
  h3s: string[]
  paragraphs: string[]
  links: { href: string; text: string; isExternal: boolean }[]
  images: { src: string; alt: string; hasAlt: boolean }[]
  structuredData: string[] // raw JSON-LD strings
  hasStructuredData: boolean
  canonicalUrl: string
  robotsMeta: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  twitterCard: string
  wordCount: number
  readingTimeMin: number
  hasHttps: boolean
  hasFAQ: boolean
  hasHowTo: boolean
  hasDefinitions: boolean
  hasCitations: boolean
  hasAuthorInfo: boolean
  hasDatePublished: boolean
  hasTableOfContents: boolean
  internalLinkCount: number
  externalLinkCount: number
  imageCount: number
  imagesWithAlt: number
  loadTimeEstimate: number // ms (based on content size)
}

export interface AISignalCheck {
  isCitedByAI: boolean
  citationSources: string[]
  perplexityVisible: boolean
  hasWikiStyle: boolean
  hasClearDefinitions: boolean
  hasNLPFriendlyStructure: boolean
}

export type ScoreStatus = 'excellent' | 'good' | 'fair' | 'poor'

export interface ApiErrorResponse {
  error: string
  message: string
  code?: string
}

export interface ApiSuccessResponse {
  data: AnalysisResult
  cached?: boolean
}
