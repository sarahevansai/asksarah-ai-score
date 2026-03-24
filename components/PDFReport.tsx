'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Loader2 } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'

interface PDFReportProps {
  result: AnalysisResult
}

function getStatusEmoji(score: number): string {
  if (score >= 80) return '✅'
  if (score >= 60) return '🟡'
  if (score >= 40) return '🟠'
  return '❌'
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#00D97E'
  if (score >= 60) return '#A8E063'
  if (score >= 40) return '#FFB020'
  return '#FF6B6B'
}

function buildHTMLReport(result: AnalysisResult): string {
  const date = new Date(result.analyzedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const totalColor = getScoreColor(result.totalScore)

  const metricsRows = result.metrics
    .map(
      (m) => `
      <tr>
        <td class="metric-name">${getStatusEmoji(m.score)} ${m.name}</td>
        <td class="score" style="color: ${getScoreColor(m.score)}">${m.score}/100</td>
        <td class="weight">${m.weight}%</td>
        <td class="status" style="color: ${getScoreColor(m.score)}">${m.status.charAt(0).toUpperCase() + m.status.slice(1)}</td>
        <td class="rec">${m.recommendation}</td>
      </tr>
    `
    )
    .join('')

  const strengthsList = result.summary.strengths
    .map((s) => `<li>✅ ${s}</li>`)
    .join('')

  const weaknessesList = result.summary.weaknesses
    .map((w) => `<li>⚠️ ${w}</li>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Visibility Report — ${result.domain}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a1a;
      background: #ffffff;
      padding: 40px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #0A0A0A;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .brand span { color: #00D4FF; }
    .report-date { font-size: 12px; color: #666; }
    .score-hero {
      display: flex;
      align-items: center;
      gap: 24px;
      background: #f8f8f8;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .score-circle {
      width: 90px; height: 90px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 4px solid ${totalColor};
      flex-shrink: 0;
    }
    .score-number {
      font-size: 32px;
      font-weight: 800;
      color: ${totalColor};
      line-height: 1;
    }
    .score-denom { font-size: 11px; color: #888; }
    .score-details h2 { font-size: 20px; font-weight: 700; }
    .score-details .domain { font-size: 14px; color: #666; margin-top: 4px; }
    .score-details .label {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background: ${totalColor}20;
      color: ${totalColor};
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #f8f8f8;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .stat-value { font-size: 24px; font-weight: 700; }
    .stat-label { font-size: 11px; color: #888; margin-top: 4px; }
    .section { margin-bottom: 28px; }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      background: #0A0A0A;
      color: white;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
    }
    td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    tr:hover td { background: #fafafa; }
    .metric-name { font-weight: 500; }
    .score { font-weight: 700; }
    .weight { color: #888; }
    .rec { color: #555; font-size: 11px; }
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .summary-card {
      background: #f8f8f8;
      border-radius: 12px;
      padding: 16px;
    }
    .summary-card h3 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
    .summary-card ul { list-style: none; }
    .summary-card li {
      font-size: 12px;
      color: #444;
      margin-bottom: 6px;
      padding-left: 4px;
    }
    .action-box {
      background: #00D4FF10;
      border: 1px solid #00D4FF30;
      border-radius: 12px;
      padding: 16px;
      margin-top: 16px;
    }
    .action-box h3 { font-size: 14px; font-weight: 700; color: #00A3CC; margin-bottom: 8px; }
    .action-box p { font-size: 12px; color: #444; }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      font-size: 11px;
      color: #888;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">ask<span>sarah</span>.ai — AI Visibility Report</div>
    <div class="report-date">Generated: ${date}<br>asksarah.ai/ai-score</div>
  </div>

  <!-- Score Hero -->
  <div class="score-hero">
    <div class="score-circle">
      <div class="score-number">${result.totalScore}</div>
      <div class="score-denom">/100</div>
    </div>
    <div class="score-details">
      <h2>AI Visibility Score</h2>
      <div class="domain">${result.url}</div>
      <div class="label">${result.scoreLabel} AI Visibility</div>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-value">${result.estimatedDA}</div>
      <div class="stat-label">Estimated Domain Authority</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${result.metrics.filter((m) => m.score >= 70).length}/${result.metrics.length}</div>
      <div class="stat-label">Metrics Passing (70+)</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${Math.round(result.metrics.reduce((a, m) => a + m.score, 0) / result.metrics.length)}</div>
      <div class="stat-label">Average Metric Score</div>
    </div>
  </div>

  <!-- Summary -->
  <div class="section">
    <div class="section-title">📊 Summary</div>
    <div class="summary-grid">
      <div class="summary-card">
        <h3>✅ What's Working</h3>
        <ul>${strengthsList || '<li>Focus on fixes first</li>'}</ul>
      </div>
      <div class="summary-card">
        <h3>⚠️ Needs Improvement</h3>
        <ul>${weaknessesList || '<li>Great — keep it up!</li>'}</ul>
      </div>
    </div>
    <div class="action-box">
      <h3>🎯 Top Priority Action</h3>
      <p>${result.summary.topAction}</p>
    </div>
  </div>

  <!-- Metrics Table -->
  <div class="section">
    <div class="section-title">📋 12-Metric Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Score</th>
          <th>Weight</th>
          <th>Status</th>
          <th>Recommendation</th>
        </tr>
      </thead>
      <tbody>
        ${metricsRows}
      </tbody>
    </table>
  </div>

  <!-- Page Info -->
  <div class="section">
    <div class="section-title">📄 Page Information</div>
    <table>
      <tr><td><strong>Title</strong></td><td>${result.pageTitle || 'N/A'}</td></tr>
      <tr><td><strong>Meta Description</strong></td><td>${result.metaDescription || 'Not found'}</td></tr>
      <tr><td><strong>Domain</strong></td><td>${result.domain}</td></tr>
      <tr><td><strong>Analyzed</strong></td><td>${date}</td></tr>
    </table>
  </div>

  <div class="footer">
    <span>Generated by asksarah.ai/ai-score</span>
    <span>For personalized fixes: chatgpt.com/g/g-6904a060fd8c8191bf5cdbc82571fee9-ai-visibility-engine-geo</span>
  </div>
</body>
</html>`
}

export default function PDFReport({ result }: PDFReportProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleDownload() {
    setIsGenerating(true)
    try {
      // Build HTML report
      const html = buildHTMLReport(result)

      // Open in new window for printing/saving as PDF
      const win = window.open('', '_blank', 'width=900,height=700')
      if (!win) {
        // Fallback: download as HTML file
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ai-visibility-report-${result.domain}-${new Date().toISOString().split('T')[0]}.html`
        a.click()
        URL.revokeObjectURL(url)
        return
      }

      win.document.write(html)
      win.document.close()

      // Trigger print dialog (user can save as PDF)
      setTimeout(() => {
        win.focus()
        win.print()
      }, 500)
    } catch (err) {
      console.error('Report generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <motion.button
      onClick={handleDownload}
      disabled={isGenerating}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="
        flex items-center gap-2 px-5 py-2.5 rounded-xl
        border border-brand-border bg-brand-surface
        text-brand-text text-sm font-medium
        hover:border-brand-muted hover:bg-brand-muted/20
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-1 focus:ring-offset-brand-dark
      "
      aria-label="Download AI Visibility Report as PDF"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Download Report</span>
        </>
      )}
    </motion.button>
  )
}
