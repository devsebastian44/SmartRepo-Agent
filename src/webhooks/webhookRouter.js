/**
 * src/webhooks/webhookRouter.js
 * Entry point for all GitHub webhook events.
 *
 * Responsibilities:
 *  1. Validate the X-Hub-Signature-256 header
 *  2. Parse JSON body
 *  3. Filter by allowed repositories
 *  4. Route to the correct controller
 */

const express                        = require('express');
const { verifySignature }            = require('../utils/verifySignature');
const { isAllowedRepository }        = require('../utils/repoFilter');
const { handleIssueOpened,
        handleIssueComment }         = require('../controllers/issueController');
const { handlePullRequestOpened }    = require('../controllers/pullRequestController');
const logger                         = require('../utils/logger');

const router = express.Router();

router.post('/github', async (req, res) => {
  // ── 1. Signature validation ───────────────────────────────────────────────
  const signature = req.headers['x-hub-signature-256'];
  if (!verifySignature(req.body, signature)) {
    logger.warn('Webhook rejected: invalid signature', { ip: req.ip });
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // ── 2. Parse payload ──────────────────────────────────────────────────────
  let payload;
  try {
    payload = JSON.parse(req.body.toString('utf8'));
  } catch (err) {
    logger.error('Failed to parse webhook payload', { error: err.message });
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const event = req.headers['x-github-event'];
  const delivery = req.headers['x-github-delivery'];

  logger.info(`📨 Webhook received: ${event}`, { delivery, action: payload.action });

  // ── 3. Repository filter ──────────────────────────────────────────────────
  const repoFullName = payload.repository?.full_name;
  if (repoFullName && !isAllowedRepository(repoFullName)) {
    return res.status(200).json({ message: 'Repository not in allowlist – skipped' });
  }

  // Acknowledge immediately (GitHub expects a response within 10 s)
  res.status(200).json({ message: 'Webhook received', event, delivery });

  // ── 4. Route event (async – errors are caught internally by each handler) ─
  setImmediate(() => routeEvent(event, payload));
});

async function routeEvent(event, payload) {
  try {
    switch (event) {
      case 'issues':
        if (payload.action === 'opened') {
          await handleIssueOpened(payload);
        } else if (payload.action === 'created') {
          // issue_comment delivers as 'issues' in some configs
          await handleIssueComment(payload);
        }
        break;

      case 'issue_comment':
        if (payload.action === 'created') {
          await handleIssueComment(payload);
        }
        break;

      case 'pull_request':
        if (['opened', 'synchronize'].includes(payload.action)) {
          await handlePullRequestOpened(payload);
        }
        break;

      case 'ping':
        logger.info('🏓 Ping received from GitHub – webhook configured successfully!');
        break;

      default:
        logger.debug(`Unhandled event: ${event}`);
    }
  } catch (err) {
    logger.error('Unhandled error in event router', { event, error: err.message, stack: err.stack });
  }
}

module.exports = router;
