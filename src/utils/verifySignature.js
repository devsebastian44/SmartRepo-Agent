/**
 * src/utils/verifySignature.js
 * Validates the X-Hub-Signature-256 header sent by GitHub on every webhook event.
 * This is the primary security gate – reject anything that doesn't match.
 */

const crypto = require('crypto')
const logger = require('./logger')

/**
 * Verifies that the incoming request genuinely comes from GitHub.
 *
 * @param {Buffer} rawBody   – Raw request body (must NOT be parsed yet)
 * @param {string} signature – Value of the `X-Hub-Signature-256` header
 * @returns {boolean}
 */
function verifySignature(rawBody, signature) {
  if (!signature) {
    logger.warn('Webhook rejected: missing X-Hub-Signature-256 header')
    return false
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (!secret) {
    logger.error('GITHUB_WEBHOOK_SECRET is not set – cannot validate webhooks')
    return false
  }

  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`

  // Use timingSafeEqual to prevent timing attacks
  try {
    const sigBuffer = Buffer.from(signature, 'utf8')
    const expectedBuffer = Buffer.from(expected, 'utf8')

    if (sigBuffer.length !== expectedBuffer.length) {
      logger.warn('Webhook signature length mismatch')
      return false
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  } catch (err) {
    logger.error('Signature comparison failed', { error: err.message })
    return false
  }
}

module.exports = { verifySignature }
