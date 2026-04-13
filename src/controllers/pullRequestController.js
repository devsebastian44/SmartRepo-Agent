/**
 * src/controllers/pullRequestController.js
 * Handles all pull_request webhook events.
 *
 * Flow:
 *  1. Extract PR metadata
 *  2. Fetch changed files
 *  3. Detect basic code smells / bad practices
 *  4. Request AI review
 *  5. Post review comment
 */

const githubService = require('../services/githubService')
const aiService = require('../services/aiService')
const { LABELS } = require('../../configs/labels')
const logger = require('../utils/logger')

/**
 * Handles `pull_request.opened` and `pull_request.synchronize` events.
 */
async function handlePullRequestOpened (payload) {
  const { repository, pull_request: pr } = payload

  const owner = repository.owner.login
  const repo = repository.name
  const pullNumber = pr.number
  const title = pr.title || ''
  const body = pr.body || ''

  logger.info(`📥 PR #${pullNumber} opened/updated`, { owner, repo, title })

  try {
    // ── Step 1: Fetch changed files ─────────────────────────────────────────
    const files = await githubService.getPullRequestFiles({ owner, repo, pullNumber })

    // ── Step 2: Static checks (fast, no AI cost) ────────────────────────────
    const issues = runStaticChecks({ pr, files })

    // ── Step 3: Apply labels ────────────────────────────────────────────────
    if (process.env.AUTO_LABEL !== 'false') {
      await githubService.addLabels({
        owner,
        repo,
        issueNumber: pullNumber,
        labels: [LABELS.AI_REVIEWED]
      })
    }

    // ── Step 4: AI review ───────────────────────────────────────────────────
    if (process.env.AUTO_COMMENT_ON_PR !== 'false') {
      const aiReview = await aiService.analyzePullRequest({ title, body, files })

      const commentBody = buildPRComment({ issues, aiReview, fileCount: files.length })
      await githubService.createComment({ owner, repo, issueNumber: pullNumber, body: commentBody })
    }

    logger.info(`✅ PR #${pullNumber} reviewed`, { owner, repo, staticIssues: issues.length })
  } catch (err) {
    logger.error(`❌ Error reviewing PR #${pullNumber}`, {
      owner,
      repo,
      error: err.message,
      stack: err.stack
    })
  }
}

// ── Static Checks ─────────────────────────────────────────────────────────────

/**
 * Runs fast, deterministic checks on the PR without touching the AI.
 * Returns an array of warning strings.
 */
function runStaticChecks ({ pr, files }) {
  const warnings = []

  // 1. Huge PR (hard to review)
  const totalChanges = files.reduce((acc, f) => acc + f.additions + f.deletions, 0)
  if (totalChanges > 500) {
    warnings.push(
      `⚠️ **Large PR detected**: ${totalChanges} lines changed across ${files.length} files. Consider splitting into smaller PRs.`
    )
  }

  // 2. Missing description
  if (!pr.body || pr.body.trim().length < 20) {
    warnings.push(
      '⚠️ **Missing description**: Please add a description explaining what this PR does and why.'
    )
  }

  // 3. Generic PR title
  const genericTitles = ['fix', 'update', 'changes', 'wip', 'test', 'misc']
  if (genericTitles.some(t => pr.title.toLowerCase().trim() === t)) {
    warnings.push(
      `⚠️ **Generic PR title**: "${pr.title}" is too vague. Use a descriptive title like "fix: resolve login crash on iOS 17".`
    )
  }

  // 4. No tests changed
  const hasTestFiles = files.some(f => /test|spec|__tests__/i.test(f.filename))
  if (!hasTestFiles && files.length > 2) {
    warnings.push(
      '⚠️ **No test files detected**: If your changes affect business logic, please add or update tests.'
    )
  }

  // 5. Large single file
  const bigFiles = files.filter(f => f.additions + f.deletions > 300)
  if (bigFiles.length > 0) {
    const names = bigFiles.map(f => f.filename).join(', ')
    warnings.push(
      `⚠️ **Large file changes**: Heavy modifications in: \`${names}\`. Ensure changes are well-documented.`
    )
  }

  // 6. package-lock / yarn.lock changed without package.json
  const lockChanged = files.some(f => /package-lock\.json|yarn\.lock/.test(f.filename))
  const pkgChanged = files.some(f => f.filename === 'package.json')
  if (lockChanged && !pkgChanged) {
    warnings.push(
      'ℹ️ **Lockfile changed** without `package.json` modification. Verify this is intentional.'
    )
  }

  return warnings
}

// ── Comment Builder ───────────────────────────────────────────────────────────

function buildPRComment ({ issues, aiReview, fileCount }) {
  const sections = [
    `## 🤖 Automated PR Review\n\n> Reviewed **${fileCount} file(s)** changed in this PR.\n`
  ]

  if (issues.length > 0) {
    sections.push('### ⚠️ Static Analysis Warnings\n')
    sections.push(`${issues.join('\n')}\n`)
  } else {
    sections.push('### ✅ Static Analysis\nNo obvious issues detected.\n')
  }

  sections.push('---\n')
  sections.push('### 🧠 AI Code Review\n')
  sections.push(aiReview)

  return sections.join('\n')
}

module.exports = { handlePullRequestOpened }
