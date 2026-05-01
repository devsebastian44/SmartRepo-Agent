/**
 * src/services/classifierService.js
 * Keyword-based issue classifier.
 * Fast, zero-cost first pass before sending content to the AI.
 * Uses a scoring approach: counts keyword hits per category.
 */

const { CLASSIFICATION_KEYWORDS, LABELS } = require('../../configs/labels')
const logger = require('../utils/logger')

/**
 * Classify an issue based on its title and body text.
 *
 * @param {{ title: string, body: string }} issue
 * @returns {{ type: string, confidence: number, label: object }}
 */
function classifyIssue ({ title = '', body = '' }) {
  const text = `${title} ${body}`.toLowerCase()
  const scores = {}

  for (const [category, keywords] of Object.entries(CLASSIFICATION_KEYWORDS)) {
    scores[category] = keywords.reduce((acc, kw) => {
      // Count occurrences of the keyword
      const regex = new RegExp(`\\b${escapeRegex(kw)}\\b`, 'gi')
      const matches = text.match(regex)
      return acc + (matches ? matches.length : 0)
    }, 0)
  }

  logger.debug('Issue classification scores', { scores, title })

  // Find highest scoring category
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const [topCategory, topScore] = sorted[0]

  // If no keywords matched at all, mark as unknown
  if (topScore === 0) {
    return {
      type: 'unknown',
      confidence: 0,
      labels: [LABELS.AI_REVIEWED]
    }
  }

  // Calculate a simple confidence percentage
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  const confidence = Math.round((topScore / totalScore) * 100)

  const labelMap = {
    bug: LABELS.BUG,
    feature: LABELS.FEATURE,
    question: LABELS.QUESTION,
    documentation: LABELS.DOCUMENTATION,
    performance: LABELS.PERFORMANCE,
    security: LABELS.SECURITY
  }

  const primaryLabel = labelMap[topCategory] || LABELS.AI_REVIEWED
  const labelsToApply = [primaryLabel, LABELS.AI_REVIEWED]

  logger.info('Issue classified', {
    title,
    type: topCategory,
    confidence: `${confidence}%`,
    score: topScore
  })

  return {
    type: topCategory,
    confidence,
    labels: labelsToApply
  }
}

function escapeRegex (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

module.exports = { classifyIssue }
