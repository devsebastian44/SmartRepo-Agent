/**
 * tests/verifySignature.test.js
 */

const crypto                  = require('crypto');
const { verifySignature }     = require('../src/utils/verifySignature');

const SECRET  = 'test-webhook-secret-123';
const PAYLOAD = Buffer.from(JSON.stringify({ action: 'opened', issue: { number: 1 } }));

function makeSignature(body, secret) {
  return `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
}

describe('verifySignature()', () => {
  beforeEach(() => {
    process.env.GITHUB_WEBHOOK_SECRET = SECRET;
  });

  afterEach(() => {
    delete process.env.GITHUB_WEBHOOK_SECRET;
  });

  it('returns true for a valid signature', () => {
    const sig = makeSignature(PAYLOAD, SECRET);
    expect(verifySignature(PAYLOAD, sig)).toBe(true);
  });

  it('returns false for an invalid signature', () => {
    expect(verifySignature(PAYLOAD, 'sha256=invalidsignature')).toBe(false);
  });

  it('returns false when signature is missing', () => {
    expect(verifySignature(PAYLOAD, undefined)).toBe(false);
    expect(verifySignature(PAYLOAD, null)).toBe(false);
    expect(verifySignature(PAYLOAD, '')).toBe(false);
  });

  it('returns false when signed with a different secret', () => {
    const sig = makeSignature(PAYLOAD, 'wrong-secret');
    expect(verifySignature(PAYLOAD, sig)).toBe(false);
  });

  it('returns false when body is tampered', () => {
    const sig          = makeSignature(PAYLOAD, SECRET);
    const tamperedBody = Buffer.from('{"action":"closed"}');
    expect(verifySignature(tamperedBody, sig)).toBe(false);
  });

  it('returns false when GITHUB_WEBHOOK_SECRET is not set', () => {
    delete process.env.GITHUB_WEBHOOK_SECRET;
    const sig = makeSignature(PAYLOAD, SECRET);
    expect(verifySignature(PAYLOAD, sig)).toBe(false);
  });
});
