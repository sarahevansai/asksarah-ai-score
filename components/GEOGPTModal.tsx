'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Sparkles, Zap } from 'lucide-react'

const GEO_GPT_URL =
  'https://chatgpt.com/g/g-6904a060fd8c8191bf5cdbc82571fee9-ai-visibility-engine-geo'

interface GEOGPTModalProps {
  isOpen: boolean
  onClose: () => void
  score: number
  domain: string
}

export default function GEOGPTModal({ isOpen, onClose, score, domain }: GEOGPTModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Focus trap + restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      setTimeout(() => closeButtonRef.current?.focus(), 100)

      // Lock body scroll
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const scoreContext =
    score < 50
      ? 'Your score shows significant room for improvement.'
      : score < 70
      ? 'You\'re on the right track but missing key AI signals.'
      : 'You have a good foundation — let\'s make it great.'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="geo-gpt-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg bg-brand-dark border border-brand-border rounded-2xl overflow-hidden shadow-2xl">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-accent/5 to-transparent pointer-events-none" />

              {/* Header */}
              <div className="relative flex items-start justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-brand-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 id="geo-gpt-title" className="text-base font-semibold text-brand-text">
                      Ready to Fix Your Score?
                    </h2>
                    <p className="text-xs text-brand-subtext mt-0.5">
                      Powered by AI Visibility Engine GEO
                    </p>
                  </div>
                </div>

                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="text-brand-subtext hover:text-brand-text transition-colors p-1 rounded-lg hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Score recap */}
              <div className="relative mx-6 mb-4 p-4 rounded-xl bg-brand-surface border border-brand-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-brand-subtext">Your AI Visibility Score</p>
                    <p className="text-2xl font-bold text-brand-text mt-0.5">
                      {score}
                      <span className="text-sm font-normal text-brand-subtext">/100</span>
                    </p>
                    <p className="text-xs text-brand-subtext mt-1">
                      {domain} — {scoreContext}
                    </p>
                  </div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold border"
                    style={{
                      borderColor: score >= 70 ? '#00D97E40' : score >= 50 ? '#FFB02040' : '#FF6B6B40',
                      background: score >= 70 ? '#00D97E10' : score >= 50 ? '#FFB02010' : '#FF6B6B10',
                      color: score >= 70 ? '#00D97E' : score >= 50 ? '#FFB020' : '#FF6B6B',
                    }}
                  >
                    {score}
                  </div>
                </div>
              </div>

              {/* Body content */}
              <div className="relative px-6 pb-2">
                <p className="text-sm text-brand-subtext leading-relaxed mb-4">
                  The <span className="text-brand-accent font-medium">AI Visibility Engine GEO</span> analyzes
                  100 AI prompts about your brand to unlock deeper insights. Then unlock API access for
                  thousands more prompts — giving you complete control over how AI perceives your company.
                </p>

                {/* Feature bullets */}
                <ul className="space-y-2 mb-5">
                  {[
                    'Analyze 100 prompts specific to your brand',
                    'See exactly what AI says about you vs competitors',
                    'Unlock API access for thousands more prompts',
                    'Get real-time visibility into AI perception',
                    'Built by Zen Media - the AI visibility experts',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-brand-subtext">
                      <Zap className="w-3.5 h-3.5 text-brand-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="relative px-6 pb-6 pt-2 flex flex-col gap-3">
                <motion.a
                  href={GEO_GPT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand-accent text-brand-black font-semibold text-sm hover:bg-brand-accent-dim transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-dark"
                  aria-label="Open AI Visibility Engine GEO in new tab"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  Open AI Visibility Engine GEO
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </motion.a>

                <button
                  onClick={onClose}
                  className="text-xs text-brand-subtext hover:text-brand-text transition-colors py-1 focus:outline-none focus:ring-2 focus:ring-brand-accent rounded"
                >
                  Maybe later — show me my full report
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
