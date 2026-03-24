/**
 * AI Visibility Scoring Engine
 * 12-metric scoring system — no external APIs required
 *
 * Metrics:
 * 1.  Structured Data (Schema.org)       — 12%
 * 2.  Content Depth & Authority          — 10%
 * 3.  E-E-A-T Signals                    — 10%
 * 4.  FAQ / Q&A Content                  — 8%
 * 5.  Clear Definitions & Explanations   — 8%
 * 6.  Heading Structure (NLP)            — 8%
 * 7.  Meta Optimization                  — 8%
 * 8.  Open Graph / Social Signals        — 6%
 * 9.  HTTPS + Technical Health           — 8%
 * 10. Image Optimization                 — 6%
 * 11. Internal Linking Structure         — 8%
 * 12. Citation-Worthiness               — 8%
 * Total: 100%
 */

import type { ScrapedData, MetricScore, AnalysisResult, ScoreStatus } from './types'
import { checkAISignals, estimateDomainAuthority } from './aiCitations'

function getStatus(score: number): ScoreStatus {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

function getScoreLabel(score: number): AnalysisResult['scoreLabel'] {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

// ─── Individual Metric Scorers ──────────────────────────────────────────────

function scoreStructuredData(scraped: ScrapedData): MetricScore {
  let score = 0
  let detail = 'No structured data found.'
  const recommendations: string[] = []

  if (scraped.hasStructuredData) {
    score += 50
    detail = `Found ${scraped.structuredData.length} structured data block(s).`

    // Parse and check for rich types
    const sdText = scraped.structuredData.join(' ').toLowerCase()
    const richTypes = [
      { key: 'faqpage', label: 'FAQPage', bonus: 15 },
      { key: 'howto', label: 'HowTo', bonus: 12 },
      { key: 'article', label: 'Article', bonus: 10 },
      { key: 'organization', label: 'Organization', bonus: 8 },
      { key: 'person', label: 'Person', bonus: 8 },
      { key: 'product', label: 'Product', bonus: 10 },
      { key: 'breadcrumb', label: 'BreadcrumbList', bonus: 5 },
      { key: 'webpage', label: 'WebPage', bonus: 5 },
      { key: 'sitelinksearchbox', label: 'Sitelinks SearchBox', bonus: 7 },
    ]

    const foundTypes: string[] = []
    for (const type of richTypes) {
      if (sdText.includes(type.key)) {
        score += type.bonus
        foundTypes.push(type.label)
      }
    }

    if (foundTypes.length > 0) {
      detail = `Structured data includes: ${foundTypes.join(', ')}.`
    }
  } else {
    recommendations.push('Add Schema.org JSON-LD structured data to all key pages.')
    recommendations.push('Start with Article, FAQPage, or Organization schemas.')
  }

  if (score < 80) {
    recommendations.push('Add FAQPage schema to make your content AI-extractable.')
    recommendations.push('Include HowTo schema for process-oriented content.')
  }

  score = Math.min(100, score)

  return {
    id: 'structured-data',
    name: 'Structured Data (Schema.org)',
    score,
    weight: 12,
    status: getStatus(score),
    description: 'Schema.org markup helps AI models extract and cite your content accurately.',
    detail,
    recommendation: recommendations[0] || 'Excellent — keep schemas updated as content changes.',
    found: scraped.hasStructuredData,
  }
}

function scoreContentDepth(scraped: ScrapedData): MetricScore {
  let score = 0
  let detail = ''

  // Word count scoring
  if (scraped.wordCount >= 2000) { score += 40; }
  else if (scraped.wordCount >= 1000) { score += 30; }
  else if (scraped.wordCount >= 500) { score += 20; }
  else if (scraped.wordCount >= 200) { score += 10; }

  // Reading time (depth signal)
  if (scraped.readingTimeMin >= 7) score += 20
  else if (scraped.readingTimeMin >= 4) score += 12
  else if (scraped.readingTimeMin >= 2) score += 6

  // Paragraph count
  const paraCount = scraped.paragraphs.length
  if (paraCount >= 10) score += 20
  else if (paraCount >= 5) score += 12
  else if (paraCount >= 3) score += 6

  // Has table of contents (signals comprehensive content)
  if (scraped.hasTableOfContents) score += 10

  // Has external citations (signals research-backed)
  if (scraped.externalLinkCount >= 5) score += 10
  else if (scraped.externalLinkCount >= 2) score += 5

  score = Math.min(100, score)
  detail = `${scraped.wordCount.toLocaleString()} words · ~${scraped.readingTimeMin} min read · ${paraCount} paragraphs.`

  const recs = []
  if (scraped.wordCount < 500) recs.push('Expand content to at least 800 words for AI visibility.')
  if (!scraped.hasTableOfContents) recs.push('Add a table of contents for long-form content.')
  if (scraped.externalLinkCount < 3) recs.push('Link to 3+ authoritative external sources.')

  return {
    id: 'content-depth',
    name: 'Content Depth & Authority',
    score,
    weight: 10,
    status: getStatus(score),
    description: 'AI models prefer comprehensive, well-researched content over thin pages.',
    detail,
    recommendation: recs[0] || 'Excellent depth — consider updating content quarterly.',
    found: scraped.wordCount > 200,
  }
}

function scoreEEAT(scraped: ScrapedData): MetricScore {
  let score = 0
  const signals: string[] = []
  const missing: string[] = []

  if (scraped.hasAuthorInfo) { score += 30; signals.push('Author info found') }
  else missing.push('Add author bio with credentials')

  if (scraped.hasDatePublished) { score += 20; signals.push('Publication date present') }
  else missing.push('Add datePublished to content')

  if (scraped.hasCitations) { score += 20; signals.push('External citations present') }
  else missing.push('Cite authoritative sources')

  if (scraped.hasStructuredData) { score += 15; signals.push('Structured data present') }
  else missing.push('Add Organization/Person schema')

  if (scraped.hasHttps) { score += 15; signals.push('Secure (HTTPS)') }

  score = Math.min(100, score)
  const detail = signals.length > 0
    ? `Signals found: ${signals.join(', ')}.`
    : 'No E-E-A-T signals detected.'

  return {
    id: 'eeat',
    name: 'E-E-A-T Signals',
    score,
    weight: 10,
    status: getStatus(score),
    description: 'Experience, Expertise, Authority, Trust — signals Google & AI models use to rank credibility.',
    detail,
    recommendation: missing[0] || 'Strong E-E-A-T — regularly update content to maintain freshness signals.',
    found: score >= 40,
  }
}

function scoreFAQ(scraped: ScrapedData): MetricScore {
  let score = 0
  let detail = ''

  if (scraped.hasFAQ) {
    score += 60
    detail = 'FAQ content detected on page.'

    // Check for FAQ schema specifically
    const hasFAQSchema = scraped.structuredData.some(
      (sd) => sd.toLowerCase().includes('"faqpage"') || sd.toLowerCase().includes('"faq"')
    )
    if (hasFAQSchema) {
      score += 30
      detail = 'FAQPage schema + FAQ content found — optimal for AI extraction.'
    } else {
      score += 10
      detail += ' Add FAQPage schema to unlock rich results.'
    }
  } else {
    detail = 'No FAQ section or FAQPage schema found.'
  }

  // Bonus: question-format headings
  const questionHeadings = [...scraped.h2s, ...scraped.h3s].filter((h) =>
    h.trim().endsWith('?') || /^(what|how|why|when|who|which|can|does|is|are)/i.test(h)
  )
  if (questionHeadings.length >= 3) {
    score += 10
    detail += ` ${questionHeadings.length} question-format headings found.`
  }

  score = Math.min(100, score)

  return {
    id: 'faq',
    name: 'FAQ / Q&A Content',
    score,
    weight: 8,
    status: getStatus(score),
    description: 'FAQ content is the #1 way to get featured in AI answers and Google\'s People Also Ask.',
    detail,
    recommendation: scraped.hasFAQ
      ? 'Add FAQPage JSON-LD schema if not already present.'
      : 'Add a FAQ section answering 5-10 questions your audience asks.',
    found: scraped.hasFAQ,
  }
}

function scoreDefinitions(scraped: ScrapedData): MetricScore {
  let score = 0
  let detail = ''

  if (scraped.hasDefinitions) {
    score += 50
    detail = 'Definitional content found — good for AI knowledge extraction.'
  } else {
    detail = 'No clear definitions or explanatory content detected.'
  }

  // Check for "What is X" style headings
  const definitionHeadings = [...scraped.h1s, ...scraped.h2s, ...scraped.h3s].filter((h) =>
    /^what is|^what are|^definition|^meaning of|^introduction to/i.test(h.trim())
  )
  if (definitionHeadings.length > 0) {
    score += 25
    detail += ` Definition headings: "${definitionHeadings[0]}"`
  }

  // Has HowTo content
  if (scraped.hasHowTo) {
    score += 15
    detail += ' How-to content found.'
  }

  // Glossary or key terms
  if (/glossary|key terms|terminology|definitions/i.test(scraped.title + scraped.metaDescription)) {
    score += 10
    detail += ' Glossary/terms page detected.'
  }

  score = Math.min(100, score)

  return {
    id: 'definitions',
    name: 'Clear Definitions & Explanations',
    score,
    weight: 8,
    status: getStatus(score),
    description: 'AI models extract and cite content that clearly defines concepts and answers "what is" questions.',
    detail,
    recommendation: score < 60
      ? 'Add "What is X?" sections with clear 1-2 sentence definitions AI can extract.'
      : 'Good definitional content — consider adding a glossary page.',
    found: scraped.hasDefinitions || scraped.hasHowTo,
  }
}

function scoreHeadingStructure(scraped: ScrapedData): MetricScore {
  let score = 0
  const notes: string[] = []

  // Single H1 (critical)
  if (scraped.h1s.length === 1) {
    score += 25
    notes.push('Single H1 ✓')
  } else if (scraped.h1s.length === 0) {
    notes.push('Missing H1!')
  } else {
    score += 10
    notes.push(`Multiple H1s (${scraped.h1s.length}) — reduce to one`)
  }

  // H2 hierarchy
  if (scraped.h2s.length >= 4) { score += 25; notes.push(`${scraped.h2s.length} H2s ✓`) }
  else if (scraped.h2s.length >= 2) { score += 15; notes.push(`${scraped.h2s.length} H2s`) }
  else { notes.push('Need more H2 sections') }

  // H3 for sub-sections
  if (scraped.h3s.length >= 3) { score += 20; notes.push(`${scraped.h3s.length} H3s ✓`) }
  else if (scraped.h3s.length >= 1) { score += 10 }

  // Keyword-rich headings (check if title keyword appears in H2)
  const titleWords = scraped.title.toLowerCase().split(' ').filter(w => w.length > 3)
  const h2Text = scraped.h2s.join(' ').toLowerCase()
  const keywordMatch = titleWords.some(w => h2Text.includes(w))
  if (keywordMatch) { score += 15; notes.push('Topic-relevant H2s ✓') }

  // Question-format headings (great for AI)
  const questionHeadings = [...scraped.h2s, ...scraped.h3s].filter(h =>
    h.endsWith('?') || /^(what|how|why|when|who)/i.test(h)
  )
  if (questionHeadings.length >= 2) { score += 15; notes.push(`${questionHeadings.length} question headings ✓`) }

  score = Math.min(100, score)

  return {
    id: 'heading-structure',
    name: 'Heading Structure (NLP-Optimized)',
    score,
    weight: 8,
    status: getStatus(score),
    description: 'Well-structured headings help AI parse and extract key information from your content.',
    detail: notes.join(' · '),
    recommendation: score < 60
      ? 'Ensure one H1, 3+ H2s with topic keywords, and question-format H3s.'
      : 'Great structure — add question-format H3s to capture more AI queries.',
    found: scraped.h1s.length > 0,
  }
}

function scoreMeta(scraped: ScrapedData): MetricScore {
  let score = 0
  const notes: string[] = []

  // Title
  if (scraped.title.length >= 30 && scraped.title.length <= 65) {
    score += 30; notes.push('Title length optimal ✓')
  } else if (scraped.title.length > 0) {
    score += 15
    notes.push(scraped.title.length < 30 ? 'Title too short' : 'Title too long')
  } else {
    notes.push('Missing title tag!')
  }

  // Meta description
  if (scraped.metaDescription.length >= 120 && scraped.metaDescription.length <= 160) {
    score += 30; notes.push('Meta description optimal ✓')
  } else if (scraped.metaDescription.length > 0) {
    score += 15; notes.push('Meta description length off')
  } else {
    notes.push('Missing meta description!')
  }

  // Canonical URL
  if (scraped.canonicalUrl) { score += 15; notes.push('Canonical URL ✓') }

  // Robots meta
  if (!scraped.robotsMeta.includes('noindex')) { score += 15; notes.push('Indexable ✓') }
  else { score -= 30; notes.push('NOINDEX detected!') }

  // Keywords meta (bonus, not required)
  if (scraped.metaKeywords) score += 5

  score = Math.max(0, Math.min(100, score))

  return {
    id: 'meta',
    name: 'Meta Optimization',
    score,
    weight: 8,
    status: getStatus(score),
    description: 'Optimized meta tags help AI models understand page context before reading content.',
    detail: notes.join(' · '),
    recommendation: score < 60
      ? 'Write a 120-160 char meta description that answers the page\'s core question.'
      : 'Meta tags look good — ensure they include your primary keyword.',
    found: scraped.title.length > 0,
  }
}

function scoreOpenGraph(scraped: ScrapedData): MetricScore {
  let score = 0
  const notes: string[] = []

  if (scraped.ogTitle) { score += 30; notes.push('OG Title ✓') }
  if (scraped.ogDescription) { score += 30; notes.push('OG Description ✓') }
  if (scraped.ogImage) { score += 25; notes.push('OG Image ✓') }
  if (scraped.twitterCard) { score += 15; notes.push('Twitter Card ✓') }

  score = Math.min(100, score)

  return {
    id: 'open-graph',
    name: 'Open Graph / Social Signals',
    score,
    weight: 6,
    status: getStatus(score),
    description: 'Social metadata signals content quality to AI crawlers and improves shareability.',
    detail: notes.length > 0 ? notes.join(' · ') : 'No Open Graph tags found.',
    recommendation: score < 60
      ? 'Add og:title, og:description, og:image, and twitter:card tags to all pages.'
      : 'Social tags complete — ensure OG image is 1200x630px.',
    found: !!(scraped.ogTitle || scraped.ogDescription),
  }
}

function scoreTechnicalHealth(scraped: ScrapedData): MetricScore {
  let score = 0
  const notes: string[] = []

  // HTTPS (critical for AI trust)
  if (scraped.hasHttps) { score += 35; notes.push('HTTPS ✓') }
  else { notes.push('HTTP only — switch to HTTPS immediately!') }

  // Page speed estimate
  if (scraped.loadTimeEstimate < 1000) { score += 30; notes.push('Fast load time ✓') }
  else if (scraped.loadTimeEstimate < 2000) { score += 20; notes.push('Moderate load time') }
  else if (scraped.loadTimeEstimate < 3000) { score += 10; notes.push('Slow load time') }
  else { notes.push('Very slow — optimize page weight') }

  // Canonical
  if (scraped.canonicalUrl) { score += 20; notes.push('Canonical ✓') }

  // Not blocked by robots
  if (!scraped.robotsMeta.includes('noindex')) { score += 15; notes.push('Indexable ✓') }
  else { score -= 20; notes.push('Noindex set!') }

  score = Math.max(0, Math.min(100, score))

  return {
    id: 'technical',
    name: 'HTTPS + Technical Health',
    score,
    weight: 8,
    status: getStatus(score),
    description: 'Technical health directly impacts whether AI crawlers can access and trust your content.',
    detail: notes.join(' · '),
    recommendation: !scraped.hasHttps
      ? 'Migrate to HTTPS immediately — required for AI crawler trust.'
      : 'Optimize Core Web Vitals to improve AI crawler priority.',
    found: scraped.hasHttps,
  }
}

function scoreImageOptimization(scraped: ScrapedData): MetricScore {
  let score = 0
  let detail = ''

  if (scraped.imageCount === 0) {
    score = 30 // No images isn't terrible, just not great
    detail = 'No images found. Consider adding relevant visuals.'
  } else {
    const altRatio = scraped.imagesWithAlt / scraped.imageCount
    detail = `${scraped.imagesWithAlt}/${scraped.imageCount} images have alt text.`

    if (altRatio >= 0.9) score += 60
    else if (altRatio >= 0.7) score += 40
    else if (altRatio >= 0.5) score += 20
    else score += 10

    // Good image count
    if (scraped.imageCount >= 3) score += 20
    else if (scraped.imageCount >= 1) score += 10

    // OG image (social sharing)
    if (scraped.ogImage) { score += 20; detail += ' OG image set ✓' }
  }

  score = Math.min(100, score)

  return {
    id: 'images',
    name: 'Image Optimization',
    score,
    weight: 6,
    status: getStatus(score),
    description: 'Alt text helps AI models understand image context and improves overall content comprehension.',
    detail,
    recommendation: scraped.imageCount > 0 && scraped.imagesWithAlt < scraped.imageCount
      ? 'Add descriptive alt text to all images — include keywords naturally.'
      : 'Add relevant images with keyword-rich alt text to boost AI comprehension.',
    found: scraped.imageCount > 0,
  }
}

function scoreInternalLinking(scraped: ScrapedData): MetricScore {
  let score = 0
  const notes: string[] = []

  // Internal links
  if (scraped.internalLinkCount >= 10) { score += 40; notes.push(`${scraped.internalLinkCount} internal links ✓`) }
  else if (scraped.internalLinkCount >= 5) { score += 25; notes.push(`${scraped.internalLinkCount} internal links`) }
  else if (scraped.internalLinkCount >= 2) { score += 15; notes.push(`${scraped.internalLinkCount} internal links — add more`) }
  else { notes.push('Too few internal links') }

  // External links (signals credibility)
  if (scraped.externalLinkCount >= 5) { score += 30; notes.push(`${scraped.externalLinkCount} external refs ✓`) }
  else if (scraped.externalLinkCount >= 2) { score += 20; notes.push(`${scraped.externalLinkCount} external refs`) }
  else { notes.push('Add external citations') }

  // Link-to-word ratio (healthy distribution)
  const linkRatio = (scraped.internalLinkCount + scraped.externalLinkCount) / Math.max(1, scraped.wordCount / 100)
  if (linkRatio >= 0.5 && linkRatio <= 3) { score += 20; notes.push('Link density optimal ✓') }
  else if (linkRatio > 3) { notes.push('Too many links (spammy)') }

  // Has citation-style content
  if (scraped.hasCitations) { score += 10; notes.push('Citations present ✓') }

  score = Math.min(100, score)

  return {
    id: 'internal-linking',
    name: 'Internal Linking Structure',
    score,
    weight: 8,
    status: getStatus(score),
    description: 'Internal linking distributes authority and helps AI understand your site\'s content hierarchy.',
    detail: notes.join(' · '),
    recommendation: scraped.internalLinkCount < 5
      ? 'Add 5-10 internal links to related content to build topical authority.'
      : 'Good linking structure — ensure anchor text is descriptive, not "click here".',
    found: scraped.internalLinkCount > 0,
  }
}

function scoreCitationWorthiness(
  scraped: ScrapedData,
  estimatedDA: number
): MetricScore {
  let score = 0
  const notes: string[] = []

  // Domain authority estimate
  if (estimatedDA >= 60) { score += 30; notes.push(`Est. DA: ${estimatedDA} ✓`) }
  else if (estimatedDA >= 40) { score += 20; notes.push(`Est. DA: ${estimatedDA}`) }
  else if (estimatedDA >= 20) { score += 10; notes.push(`Est. DA: ${estimatedDA} (building)`) }
  else { notes.push(`Est. DA: ${estimatedDA} (low)`) }

  // Content signals that make pages citation-worthy
  if (scraped.hasStructuredData) { score += 15; notes.push('Schema ✓') }
  if (scraped.hasAuthorInfo) { score += 15; notes.push('Author ✓') }
  if (scraped.hasDatePublished) { score += 10; notes.push('Date ✓') }
  if (scraped.hasCitations) { score += 15; notes.push('Cites sources ✓') }
  if (scraped.wordCount >= 1000) { score += 10; notes.push('Depth ✓') }
  if (scraped.hasHttps) { score += 5 }

  score = Math.min(100, score)

  return {
    id: 'citation-worthiness',
    name: 'Citation-Worthiness for AI',
    score,
    weight: 8,
    status: getStatus(score),
    description: 'How likely AI models (ChatGPT, Perplexity, Claude) are to cite this page in responses.',
    detail: notes.join(' · '),
    recommendation: score < 60
      ? 'Build authority: add author bio, cite sources, publish consistently, earn backlinks.'
      : 'Good citation potential — pitch your content to Perplexity\'s publisher program.',
    found: score >= 40,
  }
}

// ─── Main Scoring Function ───────────────────────────────────────────────────

export async function scoreUrl(scraped: ScrapedData): Promise<AnalysisResult> {
  const startTime = Date.now()

  const estimatedDA = estimateDomainAuthority(scraped)
  await checkAISignals(scraped) // Used for bonus signals (not blocking)

  const metrics: MetricScore[] = [
    scoreStructuredData(scraped),
    scoreContentDepth(scraped),
    scoreEEAT(scraped),
    scoreFAQ(scraped),
    scoreDefinitions(scraped),
    scoreHeadingStructure(scraped),
    scoreMeta(scraped),
    scoreOpenGraph(scraped),
    scoreTechnicalHealth(scraped),
    scoreImageOptimization(scraped),
    scoreInternalLinking(scraped),
    scoreCitationWorthiness(scraped, estimatedDA),
  ]

  // Weighted total score
  const totalScore = Math.round(
    metrics.reduce((sum, m) => sum + m.score * (m.weight / 100), 0)
  )

  // Identify strengths and weaknesses
  const sorted = [...metrics].sort((a, b) => b.score - a.score)
  const strengths = sorted
    .filter((m) => m.score >= 70)
    .slice(0, 3)
    .map((m) => `${m.name}: ${m.score}/100`)

  const weaknesses = sorted
    .reverse()
    .filter((m) => m.score < 60)
    .slice(0, 3)
    .map((m) => m.recommendation)

  // Top action = worst scoring metric's recommendation
  const worstMetric = metrics.reduce((prev, curr) => (curr.score < prev.score ? curr : prev))
  const topAction = worstMetric.recommendation

  return {
    url: scraped.url,
    domain: scraped.domain,
    analyzedAt: new Date().toISOString(),
    totalScore,
    scoreLabel: getScoreLabel(totalScore),
    metrics,
    summary: {
      strengths,
      weaknesses,
      topAction,
    },
    estimatedDA,
    pageTitle: scraped.title,
    metaDescription: scraped.metaDescription,
    processingTimeMs: Date.now() - startTime,
  }
}
