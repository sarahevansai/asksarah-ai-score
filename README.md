# AI Visibility Analyzer — asksarah.ai/ai-score

Score your website's AI visibility in seconds. See why ChatGPT, Perplexity, and Google AI Overviews aren't citing you — and get a step-by-step fix plan.

**Live URL:** https://asksarah.ai/ai-score

---

## 🚀 Deploy in 5 Minutes

### Option A: New GitHub Repo → Vercel (Recommended)

```bash
# 1. Navigate to the project
cd /path/to/asksarah-ai-score

# 2. Initialize git
git init
git add .
git commit -m "feat: AI Visibility Analyzer v1.0"

# 3. Create GitHub repo and push
gh repo create asksarah-ai-score --public --source=. --push

# 4. Deploy to Vercel
# - Go to vercel.com → New Project
# - Import asksarah-ai-score from GitHub
# - Framework: Next.js (auto-detected)
# - Click Deploy
# Done! ✅
```

### Option B: Add to Existing asksarah.ai Repo

If you have an existing `asksarah-ai` repo:

```bash
# Copy the project files into the existing repo
# The /app/ai-score directory will auto-create the route

# Then push and Vercel auto-deploys
git add .
git commit -m "feat: add AI Visibility Analyzer at /ai-score"
git push
```

### Option C: Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run dev server
npm run dev

# Open
open http://localhost:3000/ai-score
```

**Requirements:**
- Node.js 18+
- npm 8+

---

## 📁 Project Structure

```
asksarah-ai-score/
├── app/
│   ├── layout.tsx              ← Root layout with metadata
│   ├── ai-score/
│   │   └── page.tsx            ← Main analyzer page
│   └── api/
│       ├── analyze/
│       │   └── route.ts        ← POST /api/analyze (scoring endpoint)
│       └── health/
│           └── route.ts        ← GET /api/health (health check)
│
├── components/
│   ├── AnalyzerInput.tsx       ← URL input form with validation
│   ├── LoadingAnimation.tsx    ← Animated loading spinner
│   ├── ScoreCard.tsx           ← Score gauge + summary
│   ├── MetricsGrid.tsx         ← 12 expandable metric cards
│   ├── GEOGPTModal.tsx         ← GEO GPT CTA modal
│   └── PDFReport.tsx           ← HTML→PDF report download
│
├── lib/
│   ├── types.ts                ← TypeScript interfaces
│   ├── scraper.ts              ← Cheerio HTML scraping
│   ├── scorer.ts               ← 12-metric scoring engine
│   └── aiCitations.ts          ← AI signal analysis + DA estimation
│
├── styles/
│   └── globals.css             ← Tailwind + brand styles
│
├── public/
│   ├── favicon.ico             ← Add your favicon here
│   └── asksarah-logo.svg       ← Brand logo
│
├── middleware.ts               ← In-memory rate limiting
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── postcss.config.js
└── package.json
```

---

## 🎯 12 AI Visibility Metrics

| # | Metric | Weight | What It Measures |
|---|--------|--------|-----------------|
| 1 | Structured Data (Schema.org) | 12% | JSON-LD markup types and richness |
| 2 | Content Depth & Authority | 10% | Word count, reading time, research depth |
| 3 | E-E-A-T Signals | 10% | Author info, dates, citations, trust markers |
| 4 | FAQ / Q&A Content | 8% | FAQ sections + FAQPage schema |
| 5 | Clear Definitions | 8% | "What is X" definitional content |
| 6 | Heading Structure | 8% | H1/H2/H3 hierarchy and NLP optimization |
| 7 | Meta Optimization | 8% | Title + description length and quality |
| 8 | Open Graph / Social | 6% | OG tags and Twitter Card metadata |
| 9 | HTTPS + Technical | 8% | Security, speed, canonicals, indexability |
| 10 | Image Optimization | 6% | Alt text coverage and OG image |
| 11 | Internal Linking | 8% | Link structure and citation patterns |
| 12 | Citation-Worthiness | 8% | Domain authority estimate + trust signals |

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local` from `.env.example`:

```bash
# Rate limiting
RATE_LIMIT_MAX=10           # Max requests per IP per window
RATE_LIMIT_WINDOW_MS=900000 # 15-minute window

# App config
NEXT_PUBLIC_APP_URL=https://asksarah.ai
```

### Vercel Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:
- `RATE_LIMIT_MAX` = `20` (production is more generous)
- `NEXT_PUBLIC_APP_URL` = `https://asksarah.ai`

---

## 🔒 Security

- **Rate limiting:** In-memory, 10 req/15min per IP (middleware.ts)
- **SSRF protection:** Private IP ranges blocked
- **Input validation:** Zod schema on all API inputs
- **No data storage:** Completely stateless — nothing is saved
- **Security headers:** X-Content-Type-Options, X-Frame-Options, etc.

### Upgrading Rate Limiting to Redis (Optional)

For production at scale, replace the in-memory store in `middleware.ts` with Upstash Redis:

```bash
npm install @upstash/ratelimit @upstash/redis
```

Then follow [Upstash rate limiting docs](https://github.com/upstash/ratelimit).

---

## 🤖 GEO GPT Integration

After analysis, a modal appears linking to:
`https://chatgpt.com/g/g-6904a060fd8c8191bf5cdbc82571fee9-ai-visibility-engine-geo`

This is Sarah's custom GPT that turns the score into an action plan. The modal:
- Appears 2.5 seconds after results load
- Shows the user's score for context
- Links out to the GPT in a new tab
- Can be dismissed ("Maybe later")

---

## 🎨 Customization

### Brand Colors

Edit `tailwind.config.js` to change the color palette:
```js
colors: {
  brand: {
    accent: '#00D4FF',      // ← Change accent color
    'accent-dim': '#00A3CC', // ← Hover state
    // ...
  }
}
```

### Scoring Weights

Edit `lib/scorer.ts` — each metric has a `weight` field (must total 100).

### Adding Metrics

1. Add interface in `lib/types.ts`
2. Add scorer function in `lib/scorer.ts`
3. Add to the `metrics[]` array in `scoreUrl()`

---

## 📊 API Reference

### POST /api/analyze

Analyzes a URL and returns AI visibility scores.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response (200):**
```json
{
  "data": {
    "url": "https://example.com",
    "domain": "example.com",
    "analyzedAt": "2024-01-01T00:00:00.000Z",
    "totalScore": 72,
    "scoreLabel": "Good",
    "metrics": [...],
    "summary": {
      "strengths": [...],
      "weaknesses": [...],
      "topAction": "..."
    },
    "estimatedDA": 45,
    "pageTitle": "...",
    "metaDescription": "...",
    "processingTimeMs": 1234
  }
}
```

**Error responses:**
- `400` — Invalid URL or private IP
- `408` — Page timeout (>8s)
- `422` — Validation error or fetch error
- `429` — Rate limit exceeded
- `500` — Internal error

### GET /api/health

Health check endpoint.

```json
{
  "status": "ok",
  "service": "AI Visibility Analyzer",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345
}
```

---

## 🚢 Vercel Deployment Notes

- **Function timeout:** Set in `next.config.js` — default 30s (max on Pro plan)
- **Cold starts:** First request may take ~2-3s more due to Cheerio initialization
- **Memory:** ~256MB per serverless function invocation
- **Rate limiting:** Resets on cold starts — acceptable for this use case

### Vercel.json (Optional)

For custom domains or headers, create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

---

## 🐛 Troubleshooting

**"Could not resolve module cheerio"**
```bash
npm install cheerio
```

**Build error: "Module not found @/..."**
Check `tsconfig.json` has `"paths": { "@/*": ["./*"] }`

**Rate limit too aggressive in development**
Set `RATE_LIMIT_MAX=100` in `.env.local`

**Page shows 500 for certain URLs**
Some sites block scrapers. This is expected — the tool gracefully shows the error message.

---

## 📝 License

Private — © asksarah.ai. Not for redistribution.

---

Built with ❤️ for [askSarah.ai](https://asksarah.ai) by Sarah Evans
