/**
 * src/services/githubService.js
 * Thin wrapper around @octokit/rest.
 * All GitHub API calls are centralised here to keep controllers clean.
 */

const { Octokit } = require('@octokit/rest')
const logger = require('../utils/logger')

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'github-ai-automation-bot/1.0.0',
  timeZone: 'UTC',
  log: {
    debug: msg => logger.debug(msg),
    info: msg => logger.info(msg),
    warn: msg => logger.warn(msg),
    error: msg => logger.error(msg),
  },
})

// ── Comments ──────────────────────────────────────────────────────────────────

/**
 * Post a comment on an issue or PR.
 */
async function createComment({ owner, repo, issueNumber, body }) {
  try {
    const { data } = await octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    })
    logger.info(`💬 Comment posted on #${issueNumber}`, { owner, repo, commentId: data.id })
    return data
  } catch (err) {
    logger.error('Failed to create comment', { error: err.message, owner, repo, issueNumber })
    throw err
  }
}

// ── Labels ────────────────────────────────────────────────────────────────────

/**
 * Ensure a label exists in the repo (creates it if missing).
 */
async function ensureLabelExists({ owner, repo, name, color, description }) {
  try {
    await octokit.issues.getLabel({ owner, repo, name })
  } catch (err) {
    if (err.status === 404) {
      logger.info(`Creating label "${name}" in ${owner}/${repo}`)
      await octokit.issues.createLabel({ owner, repo, name, color, description })
    } else {
      throw err
    }
  }
}

/**
 * Apply an array of label names to an issue / PR.
 * Ensures each label exists first.
 */
async function addLabels({ owner, repo, issueNumber, labels }) {
  try {
    const { data: existing } = await octokit.issues.listLabelsForRepo({
      owner,
      repo,
      per_page: 100,
    })
    const existingNames = new Set(existing.map(l => l.name))

    for (const label of labels) {
      if (!existingNames.has(label.name)) {
        await ensureLabelExists({ owner, repo, ...label })
      }
    }

    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: labels.map(l => l.name),
    })

    logger.info(`🏷️  Labels applied to #${issueNumber}`, {
      owner,
      repo,
      labels: labels.map(l => l.name),
    })
  } catch (err) {
    logger.error('Failed to add labels', { error: err.message, owner, repo, issueNumber })
    throw err
  }
}

// ── Issues ────────────────────────────────────────────────────────────────────

/**
 * Fetch a single issue.
 */
async function getIssue({ owner, repo, issueNumber }) {
  const { data } = await octokit.issues.get({ owner, repo, issue_number: issueNumber })
  return data
}

// ── Pull Requests ─────────────────────────────────────────────────────────────

/**
 * Get list of files changed in a PR.
 */
async function getPullRequestFiles({ owner, repo, pullNumber }) {
  const { data } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  })
  return data
}

/**
 * Fetch PR details.
 */
async function getPullRequest({ owner, repo, pullNumber }) {
  const { data } = await octokit.pulls.get({ owner, repo, pull_number: pullNumber })
  return data
}

module.exports = {
  createComment,
  addLabels,
  ensureLabelExists,
  getIssue,
  getPullRequestFiles,
  getPullRequest,
}
