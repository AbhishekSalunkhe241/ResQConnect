import test from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Request from '../models/Request.js';
import Resource from '../models/Resource.js';
import { connectDB, getDatabaseStatus } from '../config/db.js';

let server;
let baseUrl;
let citizenAToken = '';
let citizenAId = '';
let citizenBToken = '';
let citizenBId = '';
let volunteer1Token = '';
let volunteer1Id = '';
let volunteer2Token = '';
let volunteer2Id = '';
let ngo1Token = '';
let ngo1Id = '';
let ngo2Token = '';
let ngo2Id = '';
let adminToken = '';

const testTimestamp = Date.now();
let sharedResourceId = '';
let sharedRequestId = '';

test.before(async () => {
  await connectDB();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  // Register two distinct citizens to verify strict IDOR ownership enforcement
  const regCitizen = async (name, email) => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password: 'Password123!',
        role: 'citizen',
        location: 'Panvel, Maharashtra',
      }),
    });
    const data = await res.json();
    return { token: data.token, user: data.user };
  };

  const citizenA = await regCitizen('Citizen Alpha', `citizen_a_${testTimestamp}@example.com`);
  citizenAToken = citizenA.token;
  citizenAId = citizenA.user.id;

  const citizenB = await regCitizen('Citizen Beta', `citizen_b_${testTimestamp}@example.com`);
  citizenBToken = citizenB.token;
  citizenBId = citizenB.user.id;

  // Register two distinct volunteers (and pre-verify them)
  const regVolunteer = async (name, email) => {
    const user = await User.create({
      name,
      email,
      password: 'Password123!',
      role: 'volunteer',
      verified: true,
      pendingVerification: false,
      status: 'Available',
      badge: 'Certified Responder',
    });
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' }),
    });
    const data = await loginRes.json();
    return { token: data.token, user };
  };

  const vol1 = await regVolunteer('Volunteer One', `vol1_${testTimestamp}@example.com`);
  volunteer1Token = vol1.token;
  volunteer1Id = vol1.user._id.toString();

  const vol2 = await regVolunteer('Volunteer Two', `vol2_${testTimestamp}@example.com`);
  volunteer2Token = vol2.token;
  volunteer2Id = vol2.user._id.toString();

  // Register two distinct NGOs
  const regNgo = async (name, email) => {
    const user = await User.create({
      name,
      email,
      password: 'Password123!',
      role: 'ngo',
      verified: true,
      pendingVerification: false,
    });
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' }),
    });
    const data = await loginRes.json();
    return { token: data.token, user };
  };

  const ngo1 = await regNgo('Helping Hands Alpha', `ngo1_${testTimestamp}@example.com`);
  ngo1Token = ngo1.token;
  ngo1Id = ngo1.user._id.toString();

  const ngo2 = await regNgo('Red Cross Beta', `ngo2_${testTimestamp}@example.com`);
  ngo2Token = ngo2.token;
  ngo2Id = ngo2.user._id.toString();

  // Login as seeded admin
  const adminLogin = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@resqconnect.org', password: 'ResQDemo@2026!' }),
  });
  const adminData = await adminLogin.json();
  adminToken = adminData.token;

  // Create test resource owned by NGO 1
  const resItem = await Resource.create({
    name: `Relief Rations ${testTimestamp}`,
    category: 'Food & Water',
    quantity: 25,
    unit: 'packs',
    minThreshold: 5,
    location: 'Warehouse Alpha',
    organization: 'Helping Hands Alpha',
    organizationId: ngo1.user._id,
  });
  sharedResourceId = resItem._id.toString();
});

test.after(async () => {
  try {
    await User.deleteMany({ email: { $regex: new RegExp(`${testTimestamp}`) } });
    await Request.deleteMany({ 'requester.userId': { $in: [citizenAId, citizenBId] } });
    if (sharedResourceId) {
      await Resource.findByIdAndDelete(sharedResourceId);
    }
  } catch (err) {
    // ignore
  }

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.connection.close();
});

// ============================================================================
// 1. Authentication & Role-Based Authorization
// ============================================================================
test('Auth 1. Invalid credentials return 401', async () => {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `citizen_a_${testTimestamp}@example.com`, password: 'WrongPassword!' }),
  });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.success, false);
});

test('Auth 2. Protected endpoints reject unauthenticated requests with 401', async () => {
  const res = await fetch(`${baseUrl}/requests`);
  assert.equal(res.status, 401);
});

test('Auth 3. Public registration as admin is strictly blocked with 403', async () => {
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Malicious Admin',
      email: `fake_admin_${testTimestamp}@example.com`,
      password: 'Password123!',
      role: 'admin',
    }),
  });
  assert.equal(res.status, 403);
});

// ============================================================================
// 2. Citizen Request Workflow & Server Validation
// ============================================================================
test('Citizen 1. Invalid category is rejected with 400 Bad Request', async () => {
  const res = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${citizenAToken}`,
    },
    body: JSON.stringify({
      category: 'Weapons & Ammunition', // Disallowed
      description: 'Need defense equipment immediately.',
      addressDetails: { address: 'A-1', city: 'Panvel', state: 'MH', postalCode: '410206' },
    }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.message, /invalid or missing category/i);
});

test('Citizen 2. Missing address details is rejected with 400', async () => {
  const res = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${citizenAToken}`,
    },
    body: JSON.stringify({
      category: 'Food & Water',
      description: 'Need drinking water urgently for family.',
      addressDetails: { address: '', city: '', state: '', postalCode: '' },
    }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.message, /mandatory address fields/i);
});

test('Citizen 3. Valid request submission persists in MongoDB and returns identifier', async () => {
  const res = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${citizenAToken}`,
    },
    body: JSON.stringify({
      category: 'Food & Water',
      priority: 'High',
      title: 'Drinking Water and Dry Rations',
      description: 'Clean potable water needed for 5 people stranded on 2nd floor.',
      addressDetails: {
        address: 'Sector 19, Building 4',
        city: 'Panvel',
        state: 'Maharashtra',
        postalCode: '410206',
      },
      peopleAffected: 5,
      itemsNeeded: [{ item: 'Water Can (20L)', qty: 4, unit: 'cans' }],
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.data.id);
  assert.equal(data.data.status, 'Submitted');
  assert.equal(data.data.peopleAffected, 5);

  sharedRequestId = data.data.id;

  // Verify persistence in DB directly
  const found = await Request.findOne({ id: sharedRequestId });
  assert.ok(found);
  assert.equal(found.requester.userId.toString(), citizenAId);
});

test('Citizen 4. Immediate duplicate submission is rejected with 409 Conflict', async () => {
  const res = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${citizenAToken}`,
    },
    body: JSON.stringify({
      category: 'Food & Water',
      description: 'Clean potable water needed for 5 people stranded on 2nd floor.',
      addressDetails: {
        address: 'Sector 19, Building 4',
        city: 'Panvel',
        state: 'Maharashtra',
        postalCode: '410206',
      },
      peopleAffected: 5,
    }),
  });

  assert.equal(res.status, 409);
  const data = await res.json();
  assert.match(data.message, /duplicate assistance request/i);
});

// ============================================================================
// 3. Strict IDOR Ownership Enforcement
// ============================================================================
test('Security 1. Citizen Beta cannot access Citizen Alpha private request (403 Forbidden)', async () => {
  const res = await fetch(`${baseUrl}/requests/${sharedRequestId}`, {
    headers: { Authorization: `Bearer ${citizenBToken}` },
  });
  assert.equal(res.status, 403);
  const data = await res.json();
  assert.match(data.message, /access denied/i);
});

test('Security 2. Citizen Beta request list strictly excludes Citizen Alpha requests', async () => {
  const res = await fetch(`${baseUrl}/requests`, {
    headers: { Authorization: `Bearer ${citizenBToken}` },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  // Ensure Citizen A's request is not leaked into Citizen B's response list
  const leaked = data.data.some((r) => r.id === sharedRequestId);
  assert.equal(leaked, false);
});

// ============================================================================
// 4. Volunteer Workflow & Concurrency Protection
// ============================================================================
test('Volunteer 1. Volunteer One claims verified task and mobilizes dispatch', async () => {
  // First, verify the request as Admin
  await fetch(`${baseUrl}/requests/${sharedRequestId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'Under Verification' }),
  });
  await fetch(`${baseUrl}/requests/${sharedRequestId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'Verified' }),
  });

  // Volunteer One claims task
  const res = await fetch(`${baseUrl}/requests/${sharedRequestId}/volunteer/claim`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${volunteer1Token}` },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data.status, 'Assistance In Progress');
  assert.equal(data.data.assignedVolunteer.id, volunteer1Id);
});

test('Volunteer 2. Concurrent/Conflicting claim by Volunteer Two is rejected with 409 Conflict', async () => {
  const res = await fetch(`${baseUrl}/requests/${sharedRequestId}/volunteer/claim`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${volunteer2Token}` },
  });
  assert.equal(res.status, 409);
  const data = await res.json();
  assert.match(data.message, /already been claimed/i);
});

test('Volunteer 3. Volunteer Two cannot check in on Volunteer One assignment (403 Forbidden)', async () => {
  const res = await fetch(`${baseUrl}/requests/${sharedRequestId}/volunteer/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${volunteer2Token}`,
    },
    body: JSON.stringify({ note: 'Attempting unauthorized progress update.' }),
  });
  assert.equal(res.status, 403);
});

test('Volunteer 4. Assigned Volunteer One posts check-in note and completes task', async () => {
  // Check-in
  const checkinRes = await fetch(`${baseUrl}/requests/${sharedRequestId}/volunteer/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${volunteer1Token}`,
    },
    body: JSON.stringify({ note: 'Relief dispatched and approaching site.' }),
  });
  assert.equal(checkinRes.status, 200);

  // Complete
  const completeRes = await fetch(`${baseUrl}/requests/${sharedRequestId}/volunteer/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${volunteer1Token}`,
    },
    body: JSON.stringify({
      completionNote: 'Delivered clean drinking water to household.',
      proofDescription: 'Photo and signature obtained.',
    }),
  });
  assert.equal(completeRes.status, 200);
  const data = await completeRes.json();
  assert.equal(data.data.status, 'Completed');
});

// ============================================================================
// 5. NGO Workflow & Cross-Organization Scoping
// ============================================================================
test('NGO 1. NGO Alpha allocates stock from its inventory to a new request', async () => {
  // Create an active request for NGO allocation
  const newReqRes = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${citizenAToken}`,
    },
    body: JSON.stringify({
      category: 'Food & Water',
      description: 'Second floor flood victims needing food kits.',
      addressDetails: { address: 'Plot 88', city: 'Panvel', state: 'MH', postalCode: '410206' },
      peopleAffected: 3,
    }),
  });
  const newReq = await newReqRes.json();
  const reqId = newReq.data.id;

  // NGO Alpha allocates 5 packs
  const allocRes = await fetch(`${baseUrl}/requests/${reqId}/ngo/allocate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ngo1Token}`,
    },
    body: JSON.stringify({ resourceId: sharedResourceId, quantity: 5 }),
  });

  assert.equal(allocRes.status, 200);
  const allocData = await allocRes.json();
  assert.equal(allocData.remainingStock, 20);

  // Cross-NGO protection: NGO Beta attempts to allocate or alter the same request (managed by NGO Alpha)
  const crossNgoRes = await fetch(`${baseUrl}/requests/${reqId}/ngo/allocate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ngo2Token}`,
    },
    body: JSON.stringify({ resourceId: sharedResourceId, quantity: 2 }),
  });
  assert.equal(crossNgoRes.status, 403);
  const crossData = await crossNgoRes.json();
  assert.match(crossData.message, /managed by another organization/i);
});

// ============================================================================
// 6. Admin Desk, Audit Logs, and CSV Export
// ============================================================================
test('Admin 1. Admin can fetch audit logs and export CSV', async () => {
  const auditRes = await fetch(`${baseUrl}/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(auditRes.status, 200);
  const auditData = await auditRes.json();
  assert.ok(Array.isArray(auditData.data));

  // CSV export endpoint
  const csvRes = await fetch(`${baseUrl}/admin/export/csv`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(csvRes.status, 200);
  const contentType = csvRes.headers.get('content-type');
  assert.ok(contentType.includes('text/csv'));
  const csvText = await csvRes.text();
  assert.ok(csvText.includes('Request ID'));
});

test('Admin 2. Non-admin users are rejected from admin endpoints with 403', async () => {
  const res1 = await fetch(`${baseUrl}/admin/export/csv`, {
    headers: { Authorization: `Bearer ${citizenAToken}` },
  });
  assert.equal(res1.status, 403);

  const res2 = await fetch(`${baseUrl}/admin/export/csv`, {
    headers: { Authorization: `Bearer ${volunteer1Token}` },
  });
  assert.equal(res2.status, 403);

  const res3 = await fetch(`${baseUrl}/admin/export/csv`, {
    headers: { Authorization: `Bearer ${ngo1Token}` },
  });
  assert.equal(res3.status, 403);
});

// ============================================================================
// 7. Database Health Probes & Degradation Handling
// ============================================================================
test('Health 1. System health check returns 200 and healthy status when DB connected', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.status, 'healthy');
  assert.equal(data.database.connected, true);
});

test('Health 2. Liveness probe /health/live returns 200 status alive', async () => {
  const res = await fetch(`${baseUrl}/health/live`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'alive');
});

test('Health 3. Readiness probe /health/ready returns 200 ready', async () => {
  const res = await fetch(`${baseUrl}/health/ready`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ready, true);
});
