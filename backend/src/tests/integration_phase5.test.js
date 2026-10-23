import test from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';
import app from '../app.js';
import Request from '../models/Request.js';
import Resource from '../models/Resource.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

let server;
let baseUrl;

let citizenCookies = '';
let citizenXsrf = '';
let volunteerCookies = '';
let volunteerXsrf = '';
let ngoCookies = '';
let ngoXsrf = '';
let adminCookies = '';
let adminXsrf = '';

let testRequestId = '';
let testResourceId = '';

// Helper to extract cookie string and XSRF-TOKEN from Response headers
const parseCookies = (res) => {
  const getSetCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  const cookiePairs = [];
  let xsrf = '';

  getSetCookie.forEach((header) => {
    const pair = header.split(';')[0];
    cookiePairs.push(pair);
    if (pair.startsWith('XSRF-TOKEN=')) {
      xsrf = pair.split('=')[1];
    }
  });

  return {
    cookieString: cookiePairs.join('; '),
    xsrfToken: xsrf,
  };
};

test.before(async () => {
  await connectDB();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  // Create isolated test resource for non-conflicting inventory testing
  const resItem = await Resource.create({
    name: `Phase 5 Integration Stock Item ${Date.now()}`,
    category: 'Food & Water',
    quantity: 20,
    unit: 'units',
    minThreshold: 5,
    location: 'Panvel Test Depot',
    organization: 'Helping Hands Foundation',
  });
  testResourceId = resItem._id.toString();
});

test.after(async () => {
  // Clean up isolated test request, resource, and notifications
  try {
    if (testRequestId) {
      await Request.deleteOne({ id: testRequestId });
      await Notification.deleteMany({ requestId: testRequestId });
    }
    if (testResourceId) {
      await Resource.findByIdAndDelete(testResourceId);
    }
  } catch (err) {
    console.error('Clean up error:', err);
  }

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await mongoose.connection.close();
});

test('1. Citizen logs in and creates an isolated assistance request', async () => {
  // Demo switch login as Citizen
  const loginRes = await fetch(`${baseUrl}/auth/demo-switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'citizen' }),
  });

  assert.equal(loginRes.status, 200);
  const loginBody = await loginRes.json();
  assert.equal(loginBody.user.role, 'citizen');

  const auth = parseCookies(loginRes);
  citizenCookies = auth.cookieString;
  citizenXsrf = auth.xsrfToken;

  // Create assistance request
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': citizenCookies,
  };
  if (citizenXsrf) headers['X-XSRF-TOKEN'] = citizenXsrf;

  const createRes = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      category: 'Medical Assistance',
      priority: 'High',
      title: 'Phase 5 Integration Medical Aid Test',
      description: 'Emergency antibiotics and dressing supplies needed for isolated trial test.',
      addressDetails: {
        address: 'Sector 15, Panvel East',
        city: 'Panvel',
        state: 'Maharashtra',
        postalCode: '410206',
      },
      peopleAffected: 3,
      itemsNeeded: [{ item: 'Antibiotic syrup', qty: 2, unit: 'bottles' }],
    }),
  });

  assert.equal(createRes.status, 201);
  const createBody = await createRes.json();
  assert.ok(createBody.data.id.startsWith('RQ-'));
  testRequestId = createBody.data.id;
  assert.equal(createBody.data.status, 'Submitted');
});

test('2. The request persists after refreshing the page (session lookup)', async () => {
  assert.ok(testRequestId);

  const getRes = await fetch(`${baseUrl}/requests/${testRequestId}`, {
    method: 'GET',
    headers: { 'Cookie': citizenCookies },
  });

  assert.equal(getRes.status, 200);
  const getBody = await getRes.json();
  assert.equal(getBody.data.id, testRequestId);
  assert.equal(getBody.data.title, 'Phase 5 Integration Medical Aid Test');
  assert.equal(getBody.data.status, 'Submitted');
});

test('3. NGO/Admin verifies the request through appropriate workflow steps', async () => {
  // Authenticate as NGO
  const ngoLogin = await fetch(`${baseUrl}/auth/demo-switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'ngo' }),
  });

  assert.equal(ngoLogin.status, 200);
  const auth = parseCookies(ngoLogin);
  ngoCookies = auth.cookieString;
  ngoXsrf = auth.xsrfToken;

  // Transition 1: Submitted -> Under Verification
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': ngoCookies,
  };
  if (ngoXsrf) headers['X-XSRF-TOKEN'] = ngoXsrf;

  const step1Res = await fetch(`${baseUrl}/requests/${testRequestId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      status: 'Under Verification',
      note: 'Neighborhood validation in progress by field desk.',
    }),
  });

  assert.equal(step1Res.status, 200);
  const step1Body = await step1Res.json();
  assert.equal(step1Body.data.status, 'Under Verification');

  // Transition 2: Under Verification -> Verified
  const step2Res = await fetch(`${baseUrl}/requests/${testRequestId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      status: 'Verified',
      note: 'Need validated by Helping Hands field coordinator.',
    }),
  });

  assert.equal(step2Res.status, 200);
  const step2Body = await step2Res.json();
  assert.equal(step2Body.data.status, 'Verified');
});

test('4. A verified volunteer claims or receives an assignment', async () => {
  // Authenticate as Volunteer (Priya Mehta)
  const volLogin = await fetch(`${baseUrl}/auth/demo-switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'volunteer' }),
  });

  assert.equal(volLogin.status, 200);
  const auth = parseCookies(volLogin);
  volunteerCookies = auth.cookieString;
  volunteerXsrf = auth.xsrfToken;

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': volunteerCookies,
  };
  if (volunteerXsrf) headers['X-XSRF-TOKEN'] = volunteerXsrf;

  const claimRes = await fetch(`${baseUrl}/requests/${testRequestId}/volunteer/claim`, {
    method: 'POST',
    headers,
  });

  assert.equal(claimRes.status, 200);
  const claimBody = await claimRes.json();
  assert.equal(claimBody.data.status, 'Assistance In Progress');
  assert.ok(claimBody.data.assignedVolunteer);
  assert.equal(claimBody.data.assignedVolunteer.name, 'Priya Mehta');
});

test('5. The volunteer adds a progress note and completes the task', async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': volunteerCookies,
  };
  if (volunteerXsrf) headers['X-XSRF-TOKEN'] = volunteerXsrf;

  // Check-in note
  const checkinRes = await fetch(`${baseUrl}/requests/${testRequestId}/volunteer/checkin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      note: 'Phase 5: Medical kit picked up from Panvel Central Depot. Transit underway.',
    }),
  });

  assert.equal(checkinRes.status, 200);
  const checkinBody = await checkinRes.json();
  const lastNote = checkinBody.data.checkInNotes.slice(-1)[0];
  assert.ok(lastNote.note.includes('Transit underway'));

  // Complete task
  const completeRes = await fetch(`${baseUrl}/requests/${testRequestId}/volunteer/complete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      completionNote: 'Medical supplies safely delivered to household.',
      proofDescription: 'Verified in person with citizen signature.',
    }),
  });

  assert.equal(completeRes.status, 200);
  const completeBody = await completeRes.json();
  assert.equal(completeBody.data.status, 'Completed');
  assert.equal(completeBody.data.estimatedAssistance, 'Delivered');
});

test('6. Inventory allocation updates stock correctly and prevents negative stock', async () => {
  const initialQty = 20;

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': ngoCookies,
  };
  if (ngoXsrf) headers['X-XSRF-TOKEN'] = ngoXsrf;

  // Allocate 1 unit
  const allocRes = await fetch(`${baseUrl}/requests/${testRequestId}/ngo/allocate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      resourceId: testResourceId,
      quantity: 1,
    }),
  });

  assert.equal(allocRes.status, 200);
  const allocBody = await allocRes.json();
  assert.equal(allocBody.remainingStock, initialQty - 1);

  // Negative stock / excess allocation rejection
  const excessRes = await fetch(`${baseUrl}/requests/${testRequestId}/ngo/allocate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      resourceId: testResourceId,
      quantity: 999999,
    }),
  });

  assert.ok([400, 409].includes(excessRes.status));
});

test('7. Notifications appear for the appropriate users', async () => {
  const notifRes = await fetch(`${baseUrl}/notifications`, {
    method: 'GET',
    headers: { 'Cookie': citizenCookies },
  });

  assert.equal(notifRes.status, 200);
  const notifBody = await notifRes.json();
  assert.ok(notifBody.data.length > 0);

  const reqNotifs = notifBody.data.filter((n) => n.requestId === testRequestId);
  assert.ok(reqNotifs.length >= 1);
});

test('8. Admin verification and audit views work with proper authorization', async () => {
  // Admin login
  const adminLogin = await fetch(`${baseUrl}/auth/demo-switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'admin' }),
  });

  assert.equal(adminLogin.status, 200);
  const auth = parseCookies(adminLogin);
  adminCookies = auth.cookieString;
  adminXsrf = auth.xsrfToken;

  // Admin users list
  const usersRes = await fetch(`${baseUrl}/admin/users`, {
    method: 'GET',
    headers: { 'Cookie': adminCookies },
  });

  assert.equal(usersRes.status, 200);
  const usersBody = await usersRes.json();
  assert.ok(usersBody.data.length >= 4);

  // Admin audit logs
  const auditRes = await fetch(`${baseUrl}/admin/audit-logs`, {
    method: 'GET',
    headers: { 'Cookie': adminCookies },
  });

  assert.equal(auditRes.status, 200);
  const auditBody = await auditRes.json();
  assert.ok(auditBody.data.length > 0);
});

test('9. Logging out and logging back in restores the correct session', async () => {
  const headers = { 'Cookie': adminCookies };
  if (adminXsrf) headers['X-XSRF-TOKEN'] = adminXsrf;

  const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST',
    headers,
  });

  assert.equal(logoutRes.status, 200);
  const clearedCookies = parseCookies(logoutRes).cookieString;

  // Cleared session returns 401
  const unauthRes = await fetch(`${baseUrl}/auth/me`, {
    method: 'GET',
    headers: { 'Cookie': clearedCookies },
  });

  assert.equal(unauthRes.status, 401);

  // Re-login with password
  const reloginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@resqconnect.org',
      password: process.env.DEMO_PASSWORD || 'ResQDemo@2026!',
    }),
  });

  assert.equal(reloginRes.status, 200);
  const newAuth = parseCookies(reloginRes);

  const meRes = await fetch(`${baseUrl}/auth/me`, {
    method: 'GET',
    headers: { 'Cookie': newAuth.cookieString },
  });

  assert.equal(meRes.status, 200);
  const meBody = await meRes.json();
  assert.equal(meBody.user.role, 'admin');
});

test('10. Unauthorized users cannot perform restricted operations', async () => {
  // Citizen cannot access admin audit logs
  const auditAttempt = await fetch(`${baseUrl}/admin/audit-logs`, {
    method: 'GET',
    headers: { 'Cookie': citizenCookies },
  });
  assert.equal(auditAttempt.status, 403);

  // Citizen cannot allocate NGO inventory
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': citizenCookies,
  };
  if (citizenXsrf) headers['X-XSRF-TOKEN'] = citizenXsrf;

  const allocAttempt = await fetch(`${baseUrl}/requests/${testRequestId}/ngo/allocate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      resourceId: testResourceId,
      quantity: 1,
    }),
  });
  assert.equal(allocAttempt.status, 403);

  // Volunteer cannot verify users
  const volHeaders = {
    'Content-Type': 'application/json',
    'Cookie': volunteerCookies,
  };
  if (volunteerXsrf) volHeaders['X-XSRF-TOKEN'] = volunteerXsrf;

  const verifyAttempt = await fetch(`${baseUrl}/admin/users/60d0fe4f5311236168a109ca/verify`, {
    method: 'PATCH',
    headers: volHeaders,
    body: JSON.stringify({ notes: 'Illegal verification attempt' }),
  });
  assert.equal(verifyAttempt.status, 403);
});
