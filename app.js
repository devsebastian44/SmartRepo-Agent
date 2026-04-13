/**
 * GitHub AI Automation Bot
 * Entry point – bootstraps Express server and registers all routes.
 */

require('dotenv').config()

const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const logger = require('./src/utils/logger')
const webhookRouter = require('./src/webhooks/webhookRouter')
const { validateEnv } = require('./configs/validateEnv')

// ── Validate required environment variables ───────────────────────────────────
validateEnv()

const app = express()
const PORT = process.env.PORT || 3000

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet())

// Rate limiter – protects against webhook flooding / abuse
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30', 10),
  message: { error: 'Too many requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/webhooks', limiter)

// Raw body is REQUIRED for GitHub signature validation – do NOT use express.json() globally
app.use('/webhooks', express.raw({ type: 'application/json' }))

// Health-check endpoint (useful for uptime monitors & deployment platforms)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'github-ai-automation-bot',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  })
})

// ── Webhook routes ────────────────────────────────────────────────────────────
app.use('/webhooks', webhookRouter)

// ── Root endpoint ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: '🤖 ¡Hola! El Bot de GitHub con IA está funcionando correctamente.',
    hint: 'Esta API está esperando recibir Webhooks en /webhooks/github',
    status: 'online',
  })
})

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res
    .status(404)
    .json({ error: '🤖 Ups! No hay nada en esta dirección. Prueba con /health o la ruta raíz /' })
})

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack })
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start server ──────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`🤖 GitHub AI Bot running on port ${PORT}`, {
      env: process.env.NODE_ENV,
      autoComment: process.env.AUTO_COMMENT_ON_ISSUE,
      autoLabel: process.env.AUTO_LABEL,
    })
    console.log(`\n🚀 ¡Servidor listo! Haz clic en el enlace para abrir:`)
    console.log(`➡️  http://localhost:${PORT}\n`)
  })
}

module.exports = app // exported for testing
