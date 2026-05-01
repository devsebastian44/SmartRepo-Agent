/**
 * tests/webhookRouter.test.js
 * Integration tests for the webhook endpoint using supertest.
 */

const crypto    = require('crypto');
const request   = require('supertest');

// ── Set env before loading app ────────────────────────────────────────────────
process.env.GITHUB_WEBHOOK_SECRET = 'test-secret-for-router';
process.env.GITHUB_TOKEN          = 'ghp_fake_token';
process.env.OPENAI_API_KEY        = 'sk-fake-key';
process.env.NODE_ENV              = 'test';
process.env.AUTO_COMMENT_ON_ISSUE = 'false'; // don't call real APIs in tests
process.env.AUTO_COMMENT_ON_PR    = 'false';
process.env.AUTO_LABEL            = 'false';

const app = require('../app');

function sign(payload) {
  return `sha256=${crypto
    .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')}`;
}

function makePayload(obj) {
  return JSON.stringify(obj);
}

describe('POST /webhooks/github', () => {
  const issuePayload = makePayload({
    action    : 'opened',
    repository: { owner: { login: 'testuser' }, name: 'testrepo', full_name: 'testuser/testrepo' },
    issue     : {
      number: 42,
      title : 'App crashes on login',
      body  : 'Getting a TypeError when clicking the login button',
      user  : { login: 'someuser', type: 'User' },
    },
  });

  it('returns 401 with no signature', async () => {
    const res = await request(app)
      .post('/webhooks/github')
      .set('Content-Type', 'application/json')
      .set('X-GitHub-Event', 'issues')
      .send(issuePayload);

    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid signature', async () => {
    const res = await request(app)
      .post('/webhooks/github')
      .set('Content-Type', 'application/json')
      .set('X-GitHub-Event', 'issues')
      .set('X-Hub-Signature-256', 'sha256=badsignature')
      .send(issuePayload);

    expect(res.status).toBe(401);
  });

  it('returns 200 with valid signature for issues event', async () => {
    const res = await request(app)
      .post('/webhooks/github')
      .set('Content-Type', 'application/json')
      .set('X-GitHub-Event', 'issues')
      .set('X-Hub-Signature-256', sign(issuePayload))
      .set('X-GitHub-Delivery', 'test-delivery-1')
      .send(issuePayload);

    expect(res.status).toBe(200);
    expect(res.body.event).toBe('issues');
  });

  it('returns 200 for ping event', async () => {
    const pingPayload = makePayload({ zen: 'Speak like a human.', hook_id: 123 });

    const res = await request(app)
      .post('/webhooks/github')
      .set('Content-Type', 'application/json')
      .set('X-GitHub-Event', 'ping')
      .set('X-Hub-Signature-256', sign(pingPayload))
      .send(pingPayload);

    expect(res.status).toBe(200);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
  });

  it('returns 200 for health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
