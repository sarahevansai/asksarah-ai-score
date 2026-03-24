/**
 * AI Citation Signal Checker
 *
 * Free workaround strategy — no paid APIs needed:
 * 1. Check Google's cache (site: search operator signals indexability)
 * 2. Analyze structural signals AI models prefer (NLP-friendly formatting)
 * 3. Check Wikipedia-style patterns (definitions, citations, infoboxes)
 * 4. Look for E-E-A-T signals (Experience, Expertise, Authority, Trust)
 * 5. Domain authority estimation via link patterns + TLD + age signals
 */

import type { ScrapedData, AISignalCheck } from './types'

export async function checkAISignals(scraped: ScrapedData): Promise<AISignalCheck> {
  const { domain, fullText, externalLinkCount, hasDefinitions, hasCitations, h1s, h2s, h3s } =
    prepareData(scraped)

  // ─── 1. Check if domain appears in known AI training sources ───
  const hasWikiStyle = checkWikiStyleContent(scraped)

  // ─── 2. NLP-friendly structure signals ────────────────────────
  const hasNLPFriendlyStructure = checkNLPStructure(scraped)

  // ─── 3. Clear definitions (AI loves definitional content) ──────
  const hasClearDefinitions = hasDefinitions || checkDefinitionalContent(scraped)

  // ─── 4. Perplexity visibility proxy (structural signals) ───────
  const perplexityVisible = checkPerplexitySignals(scraped)

  // ─── 5. AI citation likelihood (heuristic) ────────────────────
  const isCitedByAI = computeAICitationLikelihood(scraped, hasWikiStyle, hasNLPFriendlyStructure)

  const citationSources = buildCitationSources(scraped, isCitedByAI)

  return {
    isCitedByAI,
    citationSources,
    perplexityVisible,
    hasWikiStyle,
    hasClearDefinitions,
    hasNLPFriendlyStructure,
  }
}

function prepareData(scraped: ScrapedData) {
  const fullText = [
    scraped.title,
    scraped.metaDescription,
    ...scraped.h1s,
    ...scraped.h2s,
    ...scraped.h3s,
    ...scraped.paragraphs,
  ]
    .join(' ')
    .toLowerCase()

  return {
    domain: scraped.domain,
    fullText,
    externalLinkCount: scraped.externalLinkCount,
    hasDefinitions: scraped.hasDefinitions,
    hasCitations: scraped.hasCitations,
    h1s: scraped.h1s,
    h2s: scraped.h2s,
    h3s: scraped.h3s,
  }
}

function checkWikiStyleContent(scraped: ScrapedData): boolean {
  const signals = [
    scraped.hasDefinitions,
    scraped.hasCitations,
    scraped.externalLinkCount >= 3,
    scraped.hasStructuredData,
    scraped.hasAuthorInfo,
    scraped.wordCount > 800,
    // Check for encyclopedic-style headings
    scraped.h2s.some((h) =>
      /overview|background|history|definition|introduction|what is/i.test(h)
    ),
  ]
  return signals.filter(Boolean).length >= 3
}

function checkNLPStructure(scraped: ScrapedData): boolean {
  const signals = [
    // Good heading hierarchy
    scraped.h1s.length === 1,
    scraped.h2s.length >= 2,
    // Adequate content depth
    scraped.wordCount >= 500,
    // Uses lists and structure (proxied by h3 count)
    scraped.h3s.length >= 1,
    // Answers questions (FAQ or definition-style content)
    scraped.hasFAQ || scraped.hasDefinitions,
    // Has structured data (schema markup)
    scraped.hasStructuredData,
    // Concise meta description
    scraped.metaDescription.length > 50 && scraped.metaDescription.length < 300,
    // Has table of contents (long-form, well-organized)
    scraped.hasTableOfContents,
  ]
  return signals.filter(Boolean).length >= 4
}

function checkDefinitionalContent(scraped: ScrapedData): boolean {
  const definitionPatterns = [
    /^what is /i,
    /^how (to|does)/i,
    /^why (is|does|are)/i,
    /definition|defined|means that|refers to|is (a|an|the)/i,
  ]

  const headingsToCheck = [...scraped.h1s, ...scraped.h2s, ...scraped.h3s]
  return (
    headingsToCheck.some((h) => definitionPatterns.some((p) => p.test(h))) ||
    scraped.paragraphs
      .slice(0, 3)
      .some((p) => definitionPatterns.some((pat) => pat.test(p)))
  )
}

function checkPerplexitySignals(scraped: ScrapedData): boolean {
  // Perplexity prefers: HTTPS, fast pages, well-structured, cited content
  const signals = [
    scraped.hasHttps,
    scraped.loadTimeEstimate < 3000,
    scraped.hasStructuredData,
    scraped.externalLinkCount >= 2,
    scraped.wordCount >= 400,
    scraped.metaDescription.length > 0,
    scraped.hasCitations,
    scraped.hasAuthorInfo,
  ]
  return signals.filter(Boolean).length >= 5
}

function computeAICitationLikelihood(
  scraped: ScrapedData,
  hasWikiStyle: boolean,
  hasNLPStructure: boolean
): boolean {
  // Heuristic: pages likely to be cited by AI assistants
  const score = [
    scraped.hasHttps ? 2 : 0,
    scraped.hasStructuredData ? 2 : 0,
    hasWikiStyle ? 3 : 0,
    hasNLPStructure ? 2 : 0,
    scraped.hasCitations ? 2 : 0,
    scraped.hasAuthorInfo ? 1 : 0,
    scraped.wordCount >= 800 ? 1 : 0,
    scraped.externalLinkCount >= 5 ? 1 : 0,
    scraped.hasFAQ ? 2 : 0,
    scraped.hasDatePublished ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return score >= 8 // Threshold for "likely cited"
}

function buildCitationSources(scraped: ScrapedData, isCited: boolean): string[] {
  if (!isCited) return []

  const sources: string[] = []

  if (scraped.hasStructuredData) sources.push('Google Featured Snippets (schema.org)')
  if (scraped.hasFAQ) sources.push('Google FAQ Rich Results')
  if (scraped.hasDefinitions) sources.push('ChatGPT / Claude knowledge base')
  if (scraped.hasAuthorInfo) sources.push('Perplexity AI (E-E-A-T signals)')
  if (scraped.hasCitations) sources.push('Bing Copilot (citation-style content)')

  return sources.slice(0, 4) // Max 4 sources
}

/**
 * Estimate domain authority (0-100) without Moz API.
 * Based on: domain TLD, age signals, content depth, link patterns.
 */
export function estimateDomainAuthority(scraped: ScrapedData): number {
  const domain = scraped.domain.toLowerCase()
  let score = 30 // base score

  // TLD bonus
  if (domain.endsWith('.edu')) score += 25
  else if (domain.endsWith('.gov')) score += 25
  else if (domain.endsWith('.org')) score += 10
  else if (domain.endsWith('.com')) score += 5

  // Domain length/simplicity (shorter = older = more authority)
  const domainParts = domain.split('.')
  const mainDomain = domainParts[0]
  if (mainDomain.length <= 6) score += 8
  else if (mainDomain.length <= 10) score += 4

  // Known high-authority domains
  const highAuthorityPatterns = [
    /forbes\.com|techcrunch|wired\.com|wsj\.com|nytimes/i,
    /harvard|stanford|mit\.edu/i,
    /wikipedia\.org|britannica/i,
    /google\.com|microsoft\.com|apple\.com/i,
    /hubspot|salesforce|shopify/i,
  ]
  if (highAuthorityPatterns.some((p) => p.test(domain))) score = Math.max(score, 75)

  // Content signals
  if (scraped.wordCount >= 1000) score += 5
  if (scraped.externalLinkCount >= 10) score += 5
  if (scraped.hasStructuredData) score += 5
  if (scraped.hasAuthorInfo) score += 3
  if (scraped.hasCitations) score += 3
  if (scraped.hasHttps) score += 2

  // Penalize thin content
  if (scraped.wordCount < 200) score -= 10
  if (!scraped.hasHttps) score -= 5

  return Math.min(95, Math.max(1, Math.round(score)))
}
