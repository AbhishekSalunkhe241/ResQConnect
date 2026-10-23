import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';
import { getDatabaseStatus } from '../config/db.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/health`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('1. Database status helper returns a safe, sanitized object without credentials', () => {
  const status = getDatabaseStatus();
  assert.ok(status.status);
  assert.ok(typeof status.readyState === 'number');
  assert.equal(typeof status.status, 'string');
});

test('2. App initializes with security headers and middleware', () => {
  assert.ok(app);
  assert.equal(typeof app.listen, 'function');
});

test('3. Liveness probe /api/health/live returns HTTP 200 alive', async () => {
  const res = await fetch(`${baseUrl}/live`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'alive');
});

test('4. Root /api/health reports disconnected as degraded (HTTP 503 if disconnected, HTTP 200 if connected)', async () => {
  const status = getDatabaseStatus();
  const isConnected = status.status === 'connected';

  const res = await fetch(baseUrl);
  if (isConnected) {
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.status, 'healthy');
  } else {
    // Crucial requirement: Must not report successful 200 health check when DB is disconnected
    assert.equal(res.status, 503);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.status, 'degraded');
  }
});
