'use client'

import { motion } from 'framer-motion'
import type { AnalysisResult } from '@/lib/types'

interface ScoreCardProps {
  result: AnalysisResult
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#00D97E' // excellent
  if (score >= 60) return '#A8E063' // good
  if (score >= 40) return '#FFB020' // fair
  return '#FF6B6B' // poor
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'rgba(0, 217, 126, 0.1)'
  if (score >= 60) return 'rgba(168, 224, 99, 0.1)'
  if (score >= 40) return 'rgba(255, 176, 32, 0.1)'
  return 'rgba(255, 107, 107, 0.1)'
}

function getScoreDescription(score: number): string {
  if (score >= 80)
    return 'Your site is highly optimized for AI visibility. ChatGPT, Perplexity, and Claude are likely to cite your content.'
  if (score >= 60)
    return 'Good AI visibility with room to improve. A few targeted changes could significantly boost your citation rate.'
  if (score >= 40)
    return 'Moderate AI visibility. Your content is findable but missing key signals that AI models look for when choosing sources.'
  return 'Low AI visibility. AI models are unlikely to cite your content. Significant optimization needed.'
}

// SVG Gauge component
function ScoreGauge({ score }: { score: number }) {
  const color = getScoreColor(score)
  const radius = 70
  const strokeWidth = 10
  const circumference = Math.PI * radius // Half circle
  const progress = (score / 100) * circumference

  return (
    <div className="relative w-48 h-28 mx-auto" aria-hidden="true">
      <svg
        viewBox="0 0 160 90"
        className="w-full h-full overflow-visible"
      >
        {/* Background arc */}
        <path
          d="M 10 80 A 70 70 0 0 1 150 80"
          fill="none"
          stroke="#2A2A2A"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d="M 10 80 A 70 70 0 0 1 150 80"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
        {/* Score text */}
        <motion.text
          x="80"
          y="72"
          textAnchor="middle"
          fill="white"
          fontSize="28"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.text>
        {/* /100 */}
        <motion.text
          x="80"
          y="86"
          textAnchor="middle"
          fill="#888888"
          fontSize="10"
          fontFamily="Inter, sans-serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          out of 100
        </motion.text>
      </svg>
    </div>
  )
}

export default function ScoreCard({ result }: ScoreCardProps) {
  const scoreColor = getScoreColor(result.totalScore)
  const scoreBg = getScoreBg(result.totalScore)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Main score card */}
      <div
        className="relative rounded-2xl border overflow-hidden"
        style={{ borderColor: `${scoreColor}30`, background: scoreBg }}
      >
        {/* Gradient header */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top, ${scoreColor}, transparent 60%)`,
          }}
        />

        <div className="relative p-6 sm:p-8">
          {/* Domain + URL */}
          <div className="text-center mb-4">
            <p className="text-brand-subtext text-sm mb-1">AI Visibility Score for</p>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-text font-medium hover:text-brand-accent transition-colors text-sm break-all"
              aria-label={`Visit ${result.domain}`}
            >
              {result.domain}
            </a>
          </div>

          {/* Gauge */}
          <ScoreGauge score={result.totalScore} />

          {/* Score label */}
          <motion.div
            className="text-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span
              className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{ color: scoreColor, background: `${scoreColor}20` }}
            >
              {result.scoreLabel} AI Visibility
            </span>
          </motion.div>

          {/* Description */}
          <motion.p
            className="text-brand-subtext text-sm text-center mt-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {getScoreDescription(result.totalScore)}
          </motion.p>

          {/* Stats row */}
          <motion.div
            className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-brand-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className="text-center">
              <p className="text-xl font-bold text-brand-text">{result.estimatedDA}</p>
              <p className="text-xs text-brand-subtext mt-0.5">Est. Domain Authority</p>
            </div>
            <div className="text-center border-x border-brand-border">
              <p className="text-xl font-bold text-brand-text">
                {result.metrics.filter((m) => m.score >= 70).length}
                <span className="text-brand-subtext text-sm font-normal">/{result.metrics.length}</span>
              </p>
              <p className="text-xs text-brand-subtext mt-0.5">Metrics Passing</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-brand-text">
                {result.processingTimeMs < 1000
                  ? `${result.processingTimeMs}ms`
                  : `${(result.processingTimeMs / 1000).toFixed(1)}s`}
              </p>
              <p className="text-xs text-brand-subtext mt-0.5">Analysis Time</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        {/* Strengths */}
        {result.summary.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="rounded-xl border border-brand-border bg-brand-surface p-4"
          >
            <h3 className="text-sm font-semibold text-brand-excellent mb-3 flex items-center gap-2">
              <span>✅</span> What&apos;s Working
            </h3>
            <ul className="space-y-1.5">
              {result.summary.strengths.map((s, i) => (
                <li key={i} className="text-xs text-brand-subtext flex items-start gap-2">
                  <span className="text-brand-excellent mt-0.5 flex-shrink-0">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Top action */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3 }}
          className="rounded-xl border border-brand-accent/20 bg-brand-accent-glow p-4"
        >
          <h3 className="text-sm font-semibold text-brand-accent mb-3 flex items-center gap-2">
            <span>🎯</span> Top Action to Take
          </h3>
          <p className="text-xs text-brand-subtext leading-relaxed">
            {result.summary.topAction}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
