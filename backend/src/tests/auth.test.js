import test from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';
import { requireVerified } from '../middleware/auth.js';

let server;
let baseUrl;
const testTimestamp = Date.now();
const testCitizenEmail = `test_citizen_${testTimestamp}@example.com`;
const testVolunteerEmail = `test_volunteer_${testTimestamp}@example.com`;
const testPassword = 'TestPassword123!';
let citizenToken = '';

test.before(async () => {
  // Ensure DB is connected for integration tests
  await connectDB();

  // Start HTTP server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/auth`;
      resolve();
    });
  });
});

test.after(async () => {
  // Clean up test data created during test execution
  try {
    await User.deleteMany({ email: { $regex: /^test_/ } });
  } catch (e) {
    // ignore
  }

  // Close server and mongoose
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.connection.close();
});

// 1. Successful registration
test('1. Successful citizen registration returns 201, token, and safe user object', async () => {
  const res = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Citizen',
      email: testCitizenEmail,
      password: testPassword,
      role: 'citizen',
      location: 'Panvel, Maharashtra',
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.token);
  assert.equal(data.user.email, testCitizenEmail);
  assert.equal(data.user.role, 'citizen');
  assert.equal(data.user.verified, true);
  assert.equal(data.user.pendingVerification, false);

  // Verify HttpOnly cookie was set
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie && setCookie.includes('resq_token'));

  citizenToken = data.token;
});

// 2. Duplicate email rejection
test('2. Duplicate email registration returns 409 Conflict', async () => {
  const res = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Another User',
      email: testCitizenEmail, // same email
      password: testPassword,
      role: 'citizen',
    }),
  });

  assert.equal(res.status, 409);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.message, /already exists/i);
});

// 3. Successful login
test('3. Successful login returns 200, JWT token, and session cookie', async () => {
  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testCitizenEmail,
      password: testPassword,
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.token);
  assert.equal(data.user.email, testCitizenEmail);

  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie && setCookie.includes('resq_token'));
});

// 4. Incorrect password rejection
test('4. Incorrect password returns 401 Unauthorized', async () => {
  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testCitizenEmail,
      password: 'WrongPassword999!',
    }),
  });

  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.message, /invalid email or password/i);
});

// 5. Missing or invalid authentication on protected route
test('5. Missing or invalid token on /api/auth/me returns 401', async () => {
  // Missing token
  const resMissing = await fetch(`${baseUrl}/me`);
  assert.equal(resMissing.status, 401);

  // Invalid token
  const resInvalid = await fetch(`${baseUrl}/me`, {
    headers: { Authorization: 'Bearer this.is.an.invalid.token' },
  });
  assert.equal(resInvalid.status, 401);
});

// 6. Protected endpoint authorization
test('6. Valid Authorization Bearer token on /api/auth/me returns 200 and user profile', async () => {
  const res = await fetch(`${baseUrl}/me`, {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.email, testCitizenEmail);
});

// 7. Public admin registration rejection
test('7. Attempt to register as admin role is rejected with 403 Forbidden', async () => {
  const res = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Malicious Attacker',
      email: `fake_admin_${testTimestamp}@example.com`,
      password: 'AdminPassword123!',
      role: 'admin',
    }),
  });

  assert.equal(res.status, 403);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.message, /administrative accounts cannot be registered publicly/i);
});

// 8. Unverified volunteer/NGO permission restrictions
test('8. Volunteer registration enforces pending verification status and restrictions', async () => {
  const res = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'New Volunteer',
      email: testVolunteerEmail,
      password: testPassword,
      role: 'volunteer',
      skills: ['First Aid'],
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.user.role, 'volunteer');
  assert.equal(data.user.verified, false);
  assert.equal(data.user.pendingVerification, true);
  assert.equal(data.user.status, 'Awaiting Verification');

  // Test requireVerified middleware directly
  let nextCalled = false;
  let statusSet = null;
  let jsonSent = null;

  const mockReq = { user: data.user };
  const mockRes = {
    status: (s) => {
      statusSet = s;
      return {
        json: (j) => {
          jsonSent = j;
        },
      };
    },
  };
  const mockNext = () => {
    nextCalled = true;
  };

  requireVerified(mockReq, mockRes, mockNext);
  assert.equal(nextCalled, false);
  assert.equal(statusSet, 403);
  assert.match(jsonSent.message, /pending verification/i);
});

// 9. Password hash exclusion from responses
test('9. Password and password hash are never exposed in user responses', async () => {
  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testCitizenEmail,
      password: testPassword,
    }),
  });

  const data = await res.json();
  assert.equal(data.user.password, undefined);
  assert.equal(data.user.passwordHash, undefined);
  assert.equal(JSON.stringify(data).includes('passwordHash'), false);
});

// 10. Logout behavior
test('10. Logout clears session cookie and returns 200', async () => {
  const res = await fetch(`${baseUrl}/logout`, { method: 'POST' });
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);

  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie && setCookie.includes('resq_token=;'));
});

// 11. Demo switch endpoint
test('11. Demo switch endpoint authenticates real database accounts in development', async () => {
  const res = await fetch(`${baseUrl}/demo-switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'admin' }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.role, 'admin');
  assert.equal(data.user.email, 'admin@resqconnect.org');
  assert.ok(data.token);
});
