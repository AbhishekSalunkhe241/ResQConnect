import test from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';

let server;
let authUrl;

test.before(async () => {
  await connectDB();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      authUrl = `http://127.0.0.1:${port}/api/auth`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
});

test('Authentication Rate Limiting Suite', async (t) => {
  await t.test('1. Normal requests without test header bypass limiter in test environment', async () => {
    const res = await fetch(`${authUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'wrong' }),
    });
    // Should return normal 401 Unauthorized, not 429
    assert.equal(res.status, 401);
  });

  await t.test('2. Rapid repeated authentication attempts trigger HTTP 429 Too Many Requests', async () => {
    // Send requests with 'x-test-rate-limit': 'true' (limit set to 3 for fast testing)
    const attempts = [];
    for (let i = 0; i < 4; i++) {
      const res = await fetch(`${authUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-rate-limit': 'true',
        },
        body: JSON.stringify({ email: 'test_brute_force@example.com', password: 'wrongpassword' }),
      });
      attempts.push(res);
    }

    // First 3 should pass through to auth handler (returning 401)
    assert.equal(attempts[0].status, 401);
    assert.equal(attempts[1].status, 401);
    assert.equal(attempts[2].status, 401);

    // 4th request must be throttled with 429
    const blockedRes = attempts[3];
    assert.equal(blockedRes.status, 429);

    const body = await blockedRes.json();
    assert.equal(body.success, false);
    assert.match(body.message, /Too many authentication attempts/i);
  });
});
