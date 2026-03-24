'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ArrowRight, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnalyzerInputProps {
  onAnalyze: (url: string) => void
  isLoading: boolean
  error?: string | null
}

const EXAMPLE_URLS = [
  'yourwebsite.com',
  'blog.yourcompany.com/post',
  'yourstore.com/product-page',
]

export default function AnalyzerInput({ onAnalyze, isLoading, error }: AnalyzerInputProps) {
  const [url, setUrl] = useState('')
  const [inputError, setInputError] = useState('')
  const [placeholder, setPlaceholder] = useState(EXAMPLE_URLS[0])
  const inputRef = useRef<HTMLInputElement>(null)

  // Rotate placeholder examples
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % EXAMPLE_URLS.length
      setPlaceholder(EXAMPLE_URLS[i])
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  function validate(value: string): string {
    if (!value.trim()) return 'Please enter a URL'
    const normalized = value.startsWith('http') ? value : `https://${value}`
    try {
      new URL(normalized)
      return ''
    } catch {
      return 'Please enter a valid URL (e.g. yoursite.com)'
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate(url)
    if (err) {
      setInputError(err)
      inputRef.current?.focus()
      return
    }
    setInputError('')
    onAnalyze(url.trim())
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUrl(e.target.value)
    if (inputError) setInputError('')
  }

  const displayError = inputError || error

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} noValidate>
        <div className="relative group">
          {/* Input wrapper */}
          <div
            className={`
              relative flex items-center rounded-2xl border transition-all duration-300
              ${displayError
                ? 'border-brand-poor/60 bg-brand-poor/5'
                : 'border-brand-border bg-brand-surface hover:border-brand-muted focus-within:border-brand-accent focus-within:shadow-[0_0_0_3px_rgba(0,212,255,0.1)]'
              }
            `}
          >
            {/* Search icon */}
            <div className="flex-shrink-0 pl-5 pr-3">
              <Search
                className={`w-5 h-5 transition-colors ${
                  displayError ? 'text-brand-poor' : 'text-brand-subtext group-focus-within:text-brand-accent'
                }`}
              />
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={handleChange}
              placeholder={placeholder}
              disabled={isLoading}
              autoComplete="url"
              spellCheck={false}
              aria-label="Website URL to analyze"
              aria-invalid={!!displayError}
              aria-describedby={displayError ? 'url-error' : undefined}
              className={`
                flex-1 py-4 pr-2 bg-transparent text-brand-text placeholder-brand-subtext/60
                text-base focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />

            {/* Submit button */}
            <div className="flex-shrink-0 pr-2">
              <motion.button
                type="submit"
                disabled={isLoading || !url.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-surface
                  ${isLoading || !url.trim()
                    ? 'bg-brand-muted text-brand-subtext cursor-not-allowed'
                    : 'bg-brand-accent text-brand-black hover:bg-brand-accent-dim active:bg-brand-accent-dim'
                  }
                `}
                aria-label="Analyze URL"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
                    <span className="hidden sm:inline">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Analyze</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {displayError && (
              <motion.div
                id="url-error"
                role="alert"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 mt-2 px-1 text-sm text-brand-poor"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{displayError}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Helper text */}
      <p className="mt-3 text-center text-xs text-brand-subtext">
        Enter any public URL — homepage, blog post, landing page, or product page
      </p>
    </div>
  )
}
