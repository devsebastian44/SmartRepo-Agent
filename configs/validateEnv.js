/**
 * config/validateEnv.js
 * Validates required environment variables at startup.
 * Fails fast with a clear error message instead of a cryptic runtime crash.
 */

const REQUIRED = [
  'GITHUB_TOKEN',
  'GITHUB_WEBHOOK_SECRET',
  // AI_API_KEY is validated manually below to allow legacy names
]

function validateEnv() {
  const missing = REQUIRED.filter(key => !process.env[key])

  if (!process.env.AI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    missing.push('AI_API_KEY (or OPENAI_API_KEY / GEMINI_API_KEY)')
  }

  if (missing.length > 0) {
    console.error(
      `\n❌  Missing required environment variables:\n   ${missing.join('\n   ')}\n` +
        `   Copy .env.example → .env and fill in the values.\n`
    )
    process.exit(1)
  }
}

module.exports = { validateEnv }
