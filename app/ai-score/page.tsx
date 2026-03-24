'use client'

import { useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Sparkles, Share2 } from 'lucide-react'

import AnalyzerInput from '@/components/AnalyzerInput'
import LoadingAnimation from '@/components/LoadingAnimation'
import ScoreCard from '@/components/ScoreCard'
import MetricsGrid from '@/components/MetricsGrid'
// import GEOGPTModal from '@/components/GEOGPTModal' // Removed: CTA is inline instead
import PDFReport from '@/components/PDFReport'
import type { AnalysisResult } from '@/lib/types'

type AnalysisState = 'idle' | 'loading' | 'results' | 'error'

const TRUST_SIGNALS = [
  '🤖 12 AI Visibility Metrics',
  '⚡ Results in ~5 seconds',
  '🔒 No signup required',
  '✅ Free forever',
]

export default function AIScorePage() {
  const [state, setState] = useState<AnalysisState>('idle')
  const [analyzingUrl, setAnalyzingUrl] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  // const [showGEOModal, setShowGEOModal] = useState(false) // Removed: CTA is inline instead
  const resultsRef = useRef<HTMLDivElement>(null)

  const handleAnalyze = useCallback(async (url: string) => {
    setAnalyzingUrl(url)
    setState('loading')
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.message || `Analysis failed (${response.status})`)
      }

      setResult(json.data)
      setState('results')

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)

      // Don't show modal - instead show instructions inline
      // setTimeout(() => setShowGEOModal(true), 2500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
      setState('error')
    }
  }, [])

  const handleReset = useCallback(() => {
    setState('idle')
    setResult(null)
    setError(null)
    setAnalyzingUrl('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleShare = useCallback(async () => {
    if (!result) return
    const shareText = `I just scored my website's AI visibility: ${result.totalScore}/100 (${result.scoreLabel}) — check yours at asksarah.ai/ai-score`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My AI Visibility Score',
          text: shareText,
          url: 'https://asksarah.ai/ai-score',
        })
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText)
      // Could show a toast here
    }
  }, [result])

  return (
    <main className="min-h-screen bg-brand-black text-brand-text">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <a
          href="https://asksarah.ai"
          className="flex items-center gap-2 text-brand-text hover:text-brand-accent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent rounded"
          aria-label="asksarah.ai home"
        >
          <span className="text-lg font-bold tracking-tight">
            ask<span className="text-brand-accent">sarah</span>.ai
          </span>
        </a>

        <div className="flex items-center gap-3">
          {result && (
            <>
              <PDFReport result={result} />
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-border bg-brand-surface text-sm text-brand-subtext hover:text-brand-text hover:border-brand-muted transition-all focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Share your score"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-brand-subtext hover:text-brand-text transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent rounded-xl"
                aria-label="Analyze another URL"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">New Analysis</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero section */}
      <section className="relative z-10 px-6 pt-10 pb-12 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-medium mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          Free AI Visibility Analyzer
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4"
        >
          Is Your Website{' '}
          <span className="text-brand-accent">Visible to AI?</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-brand-subtext text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Score your site&apos;s AI visibility in seconds. See exactly why ChatGPT, Perplexity,
          and Google AI Overviews aren&apos;t citing you — and how to fix it.
        </motion.p>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
          aria-label="Features"
        >
          {TRUST_SIGNALS.map((signal, i) => (
            <span
              key={i}
              className="text-xs text-brand-subtext px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border"
            >
              {signal}
            </span>
          ))}
        </motion.div>

        {/* Input — always visible */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AnalyzerInput
            onAnalyze={handleAnalyze}
            isLoading={state === 'loading'}
            error={state === 'error' ? error : null}
          />
        </motion.div>
      </section>

      {/* Results area */}
      <div ref={resultsRef} className="relative z-10 px-6 pb-20 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Loading state */}
          {state === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <LoadingAnimation url={analyzingUrl} />
            </motion.div>
          )}

          {/* Results state */}
          {state === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Score card */}
              <ScoreCard result={result} />

              {/* Divider */}
              <div className="border-t border-brand-border" />

              {/* Metrics grid */}
              <MetricsGrid metrics={result.metrics} />

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="mt-8 p-6 rounded-2xl bg-brand-surface border border-brand-border text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5 text-brand-accent" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-brand-text mb-2">
                  Learn How to Fix Your Score
                </h3>
                <p className="text-sm text-brand-subtext mb-4 max-w-md mx-auto">
                  Share your results with the AI Visibility Engine to get personalized prompts,
                  schema templates, and step-by-step instructions for your content.
                </p>
                <a
                  href="https://chatgpt.com/g/g-6904a060fd8c8191bf5cdbc82571fee9-ai-visibility-engine-geo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-black font-semibold text-sm hover:bg-brand-accent-dim transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-surface"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  Open AI Visibility Engine GEO
                </a>
                <p className="text-xs text-brand-subtext mt-3">
                  Powered by Zen Media's AI Visibility Engine
                </p>
              </motion.div>

              {/* Analyze another */}
              <div className="text-center pt-2">
                <button
                  onClick={handleReset}
                  className="text-sm text-brand-subtext hover:text-brand-accent transition-colors underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-brand-accent rounded"
                >
                  ↩ Analyze another URL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* How it works section — shown in idle state */}
      <AnimatePresence>
        {state === 'idle' && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 px-6 pb-20 max-w-5xl mx-auto"
          >
            {/* How it works */}
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-brand-text mb-2">
                How Your AI Visibility Score Works
              </h2>
              <p className="text-brand-subtext text-sm">
                12 metrics that determine whether AI models cite your content
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: '🏗️',
                  title: 'Structured Data',
                  desc: 'Schema.org markup that lets AI extract your content accurately.',
                  weight: '12%',
                },
                {
                  icon: '📝',
                  title: 'Content Depth',
                  desc: 'Word count, reading time, and research depth signals.',
                  weight: '10%',
                },
                {
                  icon: '✅',
                  title: 'E-E-A-T Signals',
                  desc: 'Author credibility, dates, citations, and trust markers.',
                  weight: '10%',
                },
                {
                  icon: '❓',
                  title: 'FAQ Content',
                  desc: 'Q&A structure that maps directly to AI query patterns.',
                  weight: '8%',
                },
                {
                  icon: '💡',
                  title: 'Definitions',
                  desc: '"What is X" content AI models love to extract and cite.',
                  weight: '8%',
                },
                {
                  icon: '🧭',
                  title: 'Heading Structure',
                  desc: 'NLP-optimized H1/H2/H3 hierarchy for AI parsing.',
                  weight: '8%',
                },
                {
                  icon: '🏷️',
                  title: 'Meta Optimization',
                  desc: 'Title tags and meta descriptions that signal page intent.',
                  weight: '8%',
                },
                {
                  icon: '📲',
                  title: 'Open Graph',
                  desc: 'Social metadata that signals content quality to crawlers.',
                  weight: '6%',
                },
                {
                  icon: '🔒',
                  title: 'Technical Health',
                  desc: 'HTTPS, speed, and indexability — AI crawler prerequisites.',
                  weight: '8%',
                },
                {
                  icon: '🖼️',
                  title: 'Image Optimization',
                  desc: 'Alt text and OG images that boost content comprehension.',
                  weight: '6%',
                },
                {
                  icon: '🔗',
                  title: 'Internal Linking',
                  desc: 'Link structure that builds topical authority clusters.',
                  weight: '8%',
                },
                {
                  icon: '📣',
                  title: 'Citation-Worthiness',
                  desc: 'Domain authority and trust signals that make pages citable.',
                  weight: '8%',
                },
              ].map((metric, i) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">{metric.icon}</span>
                      <h3 className="text-sm font-semibold text-brand-text">{metric.title}</h3>
                    </div>
                    <span className="text-xs text-brand-accent font-mono flex-shrink-0">{metric.weight}</span>
                  </div>
                  <p className="text-xs text-brand-subtext leading-relaxed">{metric.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Why it matters section */}
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-brand-surface border border-brand-border">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-xl font-bold text-brand-text mb-3">
                  Why AI Visibility Matters
                </h2>
                <p className="text-brand-subtext text-sm leading-relaxed mb-6">
                  Over 40% of Google searches now show AI-generated answers. ChatGPT handles
                  100M+ queries/day. Perplexity is growing 400% YoY. If your site isn&apos;t
                  optimized for AI citation, you&apos;re invisible to a rapidly growing traffic source.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { stat: '40%+', label: 'Google searches with AI answers' },
                    { stat: '100M+', label: 'ChatGPT queries per day' },
                    { stat: '400%', label: 'Perplexity YoY growth' },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <div className="text-2xl font-bold text-brand-accent">{item.stat}</div>
                      <div className="text-xs text-brand-subtext mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* GEO GPT Modal */}
      {/* GEOGPTModal removed: CTA is inline in results instead */}

      {/* Footer */}
      <footer className="relative z-10 border-t border-brand-border py-8 px-6 text-center">
        <p className="text-xs text-brand-subtext">
          Built by{' '}
          <a
            href="https://asksarah.ai"
            className="text-brand-accent hover:underline focus:outline-none focus:ring-1 focus:ring-brand-accent rounded"
          >
            asksarah.ai
          </a>{' '}
          · Free tool · No data stored · Results are instant estimates
        </p>
      </footer>
    </main>
  )
}
