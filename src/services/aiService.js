/**
 * src/services/aiService.js
 * Wrapper around the OpenAI Chat Completions API.
 * All AI prompts are defined here – making it easy to swap providers.
 */

const OpenAI = require('openai')
const logger = require('../utils/logger')

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY,
  baseURL: process.env.AI_BASE_URL || undefined // undefined falls back to OpenAI default
})

const MODEL = process.env.AI_MODEL || 'gpt-4o-mini'

/**
 * Core helper – sends a chat completion request.
 * @param {string} systemPrompt
 * @param {string} userContent
 * @returns {Promise<string>}
 */
async function chat (systemPrompt, userContent) {
  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.4,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ]
  })

  return response.choices[0].message.content.trim()
}

// ── Issue Analysis ─────────────────────────────────────────────────────────────

/**
 * Analyse an issue and return a helpful, technical response.
 * @param {{ title: string, body: string, classification: string }} issue
 * @returns {Promise<string>} Markdown-formatted response
 */
async function analyzeIssueAndRespond ({ title, body, classification }) {
  const systemPrompt = `You are a senior software engineer acting as an automated GitHub bot.
Your job is to help contributors by analysing GitHub issues and providing actionable, technically precise responses.
Always respond in Markdown. Be concise but thorough. Use bullet points for lists.
Never fabricate specific line numbers or file paths unless they appear in the issue body.
End every response with "---\\n*🤖 This response was generated automatically by the GitHub AI Bot.*"`

  const userContent = `
Issue Classification: ${classification}

**Title:** ${title}

**Body:**
${body || '_(No description provided)_'}

Please:
1. Briefly acknowledge the issue type.
2. List the most likely root causes (2–4 points).
3. Provide specific, actionable suggestions to resolve or investigate further.
4. If this is a bug, include a debugging checklist.
5. If a feature request, outline possible implementation approaches.
6. If a question, answer it or point to the relevant documentation area.
`.trim()

  logger.info('🧠 Requesting AI analysis for issue', { classification, title })

  try {
    return await chat(systemPrompt, userContent)
  } catch (err) {
    logger.error('AI issue analysis failed', { error: err.message })
    return generateFallbackIssueResponse(classification)
  }
}

/**
 * Analyse a PR and return code review suggestions.
 * @param {{ title: string, body: string, files: Array<{ filename: string, additions: number, deletions: number, patch: string }> }} pr
 * @returns {Promise<string>}
 */
async function analyzePullRequest ({ title, body, files }) {
  const systemPrompt = `You are a senior software engineer performing an automated code review on GitHub.
Be constructive, specific, and professional. Focus on:
- Code quality and readability
- Potential bugs or edge cases
- Naming conventions and consistency
- Missing tests or documentation
- Security concerns
Respond in Markdown. Keep it concise – no more than 5 main points.
End with "---\\n*🤖 Automated PR review by the GitHub AI Bot.*"`

  // Summarise files changed (avoid sending huge patches to the API)
  const fileSummary = files
    .slice(0, 15) // cap at 15 files
    .map(f => {
      const patchPreview = f.patch
        ? f.patch.split('\n').slice(0, 20).join('\n')
        : '(binary or no diff)'
      return `**${f.filename}** (+${f.additions}/-${f.deletions})\n\`\`\`diff\n${patchPreview}\n\`\`\``
    })
    .join('\n\n')

  const userContent = `
**PR Title:** ${title}

**Description:**
${body || '_(No description provided)_'}

**Files changed (${files.length} total):**
${fileSummary}
`.trim()

  logger.info('🧠 Requesting AI review for PR', { title, fileCount: files.length })

  try {
    return await chat(systemPrompt, userContent)
  } catch (err) {
    logger.error('AI PR analysis failed', { error: err.message })
    return generateFallbackPRResponse()
  }
}

// ── Fallbacks (when API is unavailable) ───────────────────────────────────────

function generateFallbackIssueResponse (classification) {
  const responses = {
    bug: `## 🐛 Bug Report Received

Thank you for reporting this issue! While our AI assistant is temporarily unavailable, here are some general debugging steps:

- ✅ Check the error message and stack trace carefully.
- ✅ Reproduce the issue in a minimal environment.
- ✅ Review recent changes in the relevant area of the codebase.
- ✅ Check open issues for duplicates.

---
*🤖 Fallback response – AI assistant temporarily unavailable.*`,
    feature: `## ✨ Feature Request Received

Thanks for your suggestion! Here are the next steps:

- 📋 A maintainer will review this request.
- 💬 Please provide any additional context or use cases that would help prioritise this.
- 👍 Other users can upvote by reacting with 👍.

---
*🤖 Fallback response – AI assistant temporarily unavailable.*`,
    default: `## 👋 Thanks for opening this issue!

A maintainer or our AI bot will review it shortly. In the meantime, please ensure you have:

- Provided a clear description of the problem or request.
- Included any relevant code snippets, logs, or screenshots.
- Checked the existing issues for duplicates.

---
*🤖 Fallback response – AI assistant temporarily unavailable.*`
  }

  return responses[classification] || responses.default
}

function generateFallbackPRResponse () {
  return `## 👀 Pull Request Under Review

Thank you for your contribution! The AI reviewer is temporarily unavailable. A maintainer will review this PR shortly.

**Checklist reminders:**
- [ ] Tests added / updated
- [ ] Documentation updated
- [ ] No breaking changes (or change is documented)
- [ ] Code follows project style guidelines

---
*🤖 Fallback response – AI assistant temporarily unavailable.*`
}

module.exports = {
  analyzeIssueAndRespond,
  analyzePullRequest
}
