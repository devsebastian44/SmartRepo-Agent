/**
 * src/controllers/issueController.js
 * Handles all issue-related webhook events.
 *
 * Flow:
 *  1. Extract repo & issue metadata from payload
 *  2. Classify the issue (keyword-based, fast)
 *  3. Apply labels
 *  4. Request AI analysis
 *  5. Post a comment with the AI response
 */

const githubService     = require('../services/githubService');
const aiService         = require('../services/aiService');
const { classifyIssue } = require('../services/classifierService');
const logger            = require('../utils/logger');

/**
 * Handles the `issues.opened` event.
 * @param {object} payload – Full GitHub webhook payload
 */
async function handleIssueOpened(payload) {
  const { repository, issue } = payload;

  const owner       = repository.owner.login;
  const repo        = repository.name;
  const issueNumber = issue.number;
  const title       = issue.title || '';
  const body        = issue.body  || '';

  logger.info(`📥 New issue #${issueNumber} opened`, { owner, repo, title });

  try {
    // ── Step 1: Classify ────────────────────────────────────────────────────
    const { type, confidence, labels } = classifyIssue({ title, body });

    // ── Step 2: Auto-label ──────────────────────────────────────────────────
    if (process.env.AUTO_LABEL !== 'false') {
      await githubService.addLabels({ owner, repo, issueNumber, labels });
    }

    // ── Step 3: AI comment ──────────────────────────────────────────────────
    if (process.env.AUTO_COMMENT_ON_ISSUE !== 'false') {
      const aiResponse = await aiService.analyzeIssueAndRespond({
        title,
        body,
        classification: type,
      });

      const commentBody = buildIssueComment({ type, confidence, aiResponse });
      await githubService.createComment({ owner, repo, issueNumber, body: commentBody });
    }

    logger.info(`✅ Issue #${issueNumber} processed`, { owner, repo, type, confidence });
  } catch (err) {
    logger.error(`❌ Error processing issue #${issueNumber}`, {
      owner, repo,
      error: err.message,
      stack: err.stack,
    });
    // Don't re-throw – we don't want the webhook to retry for app-level errors
  }
}

/**
 * Handles the `issue_comment.created` event (ignores bot comments).
 */
async function handleIssueComment(payload) {
  const { comment, repository, issue } = payload;

  // Ignore comments made by bots (including ourselves)
  if (comment.user.type === 'Bot' || comment.user.login.endsWith('[bot]')) {
    logger.debug('Ignoring bot comment', { login: comment.user.login });
    return;
  }

  const owner       = repository.owner.login;
  const repo        = repository.name;
  const issueNumber = issue.number;

  logger.info(`💬 New comment on #${issueNumber}`, { owner, repo, user: comment.user.login });

  // Optionally: handle mentions, commands, etc.
  // e.g., "@bot analyse" → re-run analysis
  // For now, just log and return
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildIssueComment({ type, confidence, aiResponse }) {
  const typeEmoji = {
    bug          : '🐛',
    feature      : '✨',
    question     : '❓',
    documentation: '📚',
    performance  : '⚡',
    security     : '🔒',
    unknown      : '🔍',
  };

  const emoji = typeEmoji[type] || '🔍';

  return [
    `## ${emoji} Automated Issue Analysis`,
    '',
    `> **Classification:** \`${type}\` (${confidence}% confidence)`,
    '',
    aiResponse,
  ].join('\n');
}

module.exports = { handleIssueOpened, handleIssueComment };
