/**
 * src/utils/repoFilter.js
 * Optional allowlist: if ALLOWED_REPOSITORIES is set in .env,
 * only events from those repos are processed.
 *
 * Format: "owner/repo1,owner/repo2"
 */

const logger = require('./logger')

function isAllowedRepository(fullName) {
  const allowed = process.env.ALLOWED_REPOSITORIES

  // If no filter configured, allow everything
  if (!allowed || allowed.trim() === '') return true

  const list = allowed.split(',').map(r => r.trim().toLowerCase())
  const isAllowed = list.includes(fullName.toLowerCase())

  if (!isAllowed) {
    logger.info(`Repository "${fullName}" is not in the allowlist – skipping event`)
  }

  return isAllowed
}

module.exports = { isAllowedRepository }
