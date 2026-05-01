/**
 * tests/classifierService.test.js
 */

const { classifyIssue } = require('../src/services/classifierService');

describe('classifyIssue()', () => {
  // ── Bug detection ──────────────────────────────────────────────────────────
  describe('bug detection', () => {
    it('classifies a crash report as bug', () => {
      const result = classifyIssue({
        title: 'App crashes when clicking login',
        body : 'Getting a TypeError: Cannot read properties of undefined.\nStack trace: ...',
      });
      expect(result.type).toBe('bug');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('classifies a "not working" report as bug', () => {
      const result = classifyIssue({
        title: 'Upload button not working',
        body : 'The button does not work on Firefox. Error: 500 Internal Server Error',
      });
      expect(result.type).toBe('bug');
    });
  });

  // ── Feature detection ──────────────────────────────────────────────────────
  describe('feature request detection', () => {
    it('classifies a feature request', () => {
      const result = classifyIssue({
        title: 'Feature request: add dark mode',
        body : 'It would be great if the app supported dark mode. I would love to have this enhancement.',
      });
      expect(result.type).toBe('feature');
    });

    it('classifies "would be great" as feature', () => {
      const result = classifyIssue({
        title: 'Support for multiple themes',
        body : 'Could you please add support for custom themes? This would be a great improvement.',
      });
      expect(result.type).toBe('feature');
    });
  });

  // ── Question detection ─────────────────────────────────────────────────────
  describe('question detection', () => {
    it('classifies a how-to question', () => {
      const result = classifyIssue({
        title: 'How do I configure the timeout?',
        body : 'I need help understanding how to set the request timeout. The documentation is unclear.',
      });
      expect(result.type).toBe('question');
    });
  });

  // ── Security detection ─────────────────────────────────────────────────────
  describe('security detection', () => {
    it('classifies a security vulnerability', () => {
      const result = classifyIssue({
        title: 'Security vulnerability: XSS in comment field',
        body : 'Potential XSS attack vector. The user input is not sanitised before rendering. CVE pending.',
      });
      expect(result.type).toBe('security');
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('returns unknown for empty issue', () => {
      const result = classifyIssue({ title: '', body: '' });
      expect(result.type).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('always includes the ai-reviewed label', () => {
      const result = classifyIssue({ title: 'Some issue', body: 'Some description' });
      const labelNames = result.labels.map((l) => l.name);
      expect(labelNames).toContain('ai-reviewed');
    });

    it('returns confidence between 0 and 100', () => {
      const result = classifyIssue({
        title: 'Bug with feature request',
        body : 'There is a bug and I would also like a new feature enhancement',
      });
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });
  });
});
