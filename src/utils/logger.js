/**
 * src/utils/logger.js
 * Centralized Winston logger with daily rotating files and structured JSON output.
 */

const { createLogger, format, transports } = require('winston')
const path = require('path')
const fs = require('fs')

const LOG_DIR = process.env.LOG_DIR || './logs'
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

const { combine, timestamp, errors, json, colorize, printf } = format

// Pretty format for console (dev-friendly)
const consoleFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : ''
  return `${ts} [${level}] ${message}${metaStr}`
})

const logger = createLogger({
  level: LOG_LEVEL,
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), json()),
  defaultMeta: { service: 'github-ai-bot' },
  transports: [
    // All logs → combined.log
    new transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
      tailable: true
    }),
    // Errors only → error.log
    new transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
      tailable: true
    })
  ]
})

// Console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(colorize({ all: true }), timestamp({ format: 'HH:mm:ss' }), consoleFormat)
    })
  )
}

module.exports = logger
