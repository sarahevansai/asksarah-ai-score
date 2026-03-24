'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import type { MetricScore } from '@/lib/types'

interface MetricsGridProps {
  metrics: MetricScore[]
}

const STATUS_CONFIG = {
  excellent: {
    color: '#00D97E',
    bg: 'rgba(0, 217, 126, 0.1)',
    border: 'rgba(0, 217, 126, 0.3)',
    label: 'Excellent',
    icon: CheckCircle,
  },
  good: {
    color: '#A8E063',
    bg: 'rgba(168, 224, 99, 0.1)',
    border: 'rgba(168, 224, 99, 0.3)',
    label: 'Good',
    icon: CheckCircle,
  },
  fair: {
    color: '#FFB020',
    bg: 'rgba(255, 176, 32, 0.1)',
    border: 'rgba(255, 176, 32, 0.3)',
    label: 'Fair',
    icon: AlertCircle,
  },
  poor: {
    color: '#FF6B6B',
    bg: 'rgba(255, 107, 107, 0.1)',
    border: 'rgba(255, 107, 107, 0.3)',
    label: 'Needs Work',
    icon: XCircle,
  },
}

function MetricRow({ metric, index }: { metric: MetricScore; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const config = STATUS_CONFIG[metric.status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left rounded-xl border transition-all duration-200 hover:border-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-1 focus:ring-offset-brand-dark"
        style={{
          borderColor: expanded ? config.border : '#2A2A2A',
          background: expanded ? config.bg : '#1A1A1A',
        }}
        aria-expanded={expanded}
        aria-label={`${metric.name}: ${metric.score}/100 - ${config.label}`}
      >
        <div className="flex items-center gap-3 p-4">
          {/* Status icon */}
          <Icon
            className="flex-shrink-0 w-4 h-4"
            style={{ color: config.color }}
            aria-hidden="true"
          />

          {/* Metric name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-brand-text truncate">
                {metric.name}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Score badge */}
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ color: config.color, background: config.bg }}
                >
                  {metric.score}
                </span>
                {/* Weight */}
                <span className="text-xs text-brand-subtext hidden sm:inline">
                  {metric.weight}%
                </span>
                {/* Chevron */}
                <ChevronDown
                  className={`w-4 h-4 text-brand-subtext transition-transform ${
                    expanded ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-brand-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: config.color }}
                initial={{ width: 0 }}
                animate={{ width: `${metric.score}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-brand-border/50 pt-3 space-y-3">
                {/* Description */}
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-brand-subtext flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs text-brand-subtext leading-relaxed">
                    {metric.description}
                  </p>
                </div>

                {/* Current state */}
                {metric.detail && (
                  <div className="rounded-lg p-3" style={{ background: config.bg }}>
                    <p className="text-xs leading-relaxed" style={{ color: config.color }}>
                      <span className="font-semibold">Found: </span>
                      {metric.detail}
                    </p>
                  </div>
                )}

                {/* Recommendation */}
                {metric.score < 90 && (
                  <div className="rounded-lg p-3 bg-brand-black/40 border border-brand-border">
                    <p className="text-xs text-brand-subtext leading-relaxed">
                      <span className="text-brand-accent font-semibold">💡 Fix: </span>
                      {metric.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  )
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  const [filter, setFilter] = useState<'all' | 'poor' | 'fair' | 'good'>('all')

  const filtered = metrics.filter((m) => {
    if (filter === 'all') return true
    if (filter === 'poor') return m.status === 'poor'
    if (filter === 'fair') return m.status === 'fair' || m.status === 'poor'
    if (filter === 'good') return m.status === 'excellent' || m.status === 'good'
    return true
  })

  const counts = {
    excellent: metrics.filter((m) => m.status === 'excellent').length,
    good: metrics.filter((m) => m.status === 'good').length,
    fair: metrics.filter((m) => m.status === 'fair').length,
    poor: metrics.filter((m) => m.status === 'poor').length,
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-brand-text">
          12 AI Visibility Metrics
        </h2>
        <div className="flex items-center gap-2 text-xs text-brand-subtext">
          <span className="text-brand-excellent">●</span> {counts.excellent + counts.good} passing
          <span className="ml-1 text-brand-poor">●</span> {counts.fair + counts.poor} need work
        </div>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-1 mb-4 p-1 rounded-xl bg-brand-surface border border-brand-border"
        role="tablist"
        aria-label="Filter metrics by status"
      >
        {[
          { key: 'all', label: `All (${metrics.length})` },
          { key: 'poor', label: `🔴 Needs Work (${counts.poor})` },
          { key: 'fair', label: `🟡 Fair (${counts.fair})` },
          { key: 'good', label: `🟢 Good (${counts.excellent + counts.good})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key as typeof filter)}
            className={`
              flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all
              focus:outline-none focus:ring-2 focus:ring-brand-accent
              ${filter === key
                ? 'bg-brand-accent text-brand-black'
                : 'text-brand-subtext hover:text-brand-text'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Metrics list */}
      <div className="space-y-2" role="list">
        <AnimatePresence mode="popLayout">
          {filtered.map((metric, i) => (
            <div key={metric.id} role="listitem">
              <MetricRow metric={metric} index={i} />
            </div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-brand-subtext text-sm">
            No metrics match this filter.
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-brand-subtext">
        <span>Score out of 100 per metric.</span>
        <span>Weight = contribution to total score.</span>
        <span>Click any metric to see details + fix.</span>
      </div>
    </div>
  )
}
