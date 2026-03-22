/**
 * config/labels.js
 * Central label configuration.
 * Modify this file to customize labels without touching business logic.
 */

const LABELS = {
  BUG: {
    name       : 'bug',
    color      : 'd73a4a',
    description: 'Something isn\'t working',
  },
  FEATURE: {
    name       : 'enhancement',
    color      : 'a2eeef',
    description: 'New feature or request',
  },
  QUESTION: {
    name       : 'question',
    color      : 'd876e3',
    description: 'Further information is requested',
  },
  DOCUMENTATION: {
    name       : 'documentation',
    color      : '0075ca',
    description: 'Improvements or additions to documentation',
  },
  PERFORMANCE: {
    name       : 'performance',
    color      : 'e4e669',
    description: 'Performance related issue',
  },
  SECURITY: {
    name       : 'security',
    color      : 'e11d48',
    description: 'Security vulnerability or concern',
  },
  AI_REVIEWED: {
    name       : 'ai-reviewed',
    color      : '6366f1',
    description: 'Automatically reviewed by AI bot',
  },
};

/**
 * Keywords used by the classifier to detect issue type.
 * You can add more keywords to improve accuracy.
 */
const CLASSIFICATION_KEYWORDS = {
  bug: [
    'bug', 'error', 'crash', 'fail', 'broken', 'issue', 'problem',
    'exception', 'stack trace', 'undefined', 'null', 'cannot', 'does not work',
    'not working', 'TypeError', 'ReferenceError', '500', '404', 'segfault',
  ],
  feature: [
    'feature', 'enhancement', 'improve', 'add', 'request', 'support',
    'would be great', 'could you', 'should', 'wish', 'want', 'need',
    'implement', 'allow', 'enable', 'provide', 'integration',
  ],
  question: [
    'how', 'what', 'why', 'when', 'where', 'who', 'help', 'question',
    'explain', 'understand', 'confused', 'documentation', 'example', '?',
    'clarify', 'meaning', 'guide',
  ],
  documentation: [
    'docs', 'documentation', 'readme', 'wiki', 'guide', 'tutorial',
    'example', 'usage', 'api reference', 'typo', 'missing docs',
  ],
  performance: [
    'slow', 'performance', 'memory', 'cpu', 'leak', 'latency', 'speed',
    'optimize', 'bottleneck', 'timeout', 'cache', 'load time',
  ],
  security: [
    'security', 'vulnerability', 'exploit', 'injection', 'xss', 'csrf',
    'auth', 'token', 'credential', 'exposed', 'cve', 'attack',
  ],
};

module.exports = { LABELS, CLASSIFICATION_KEYWORDS };
