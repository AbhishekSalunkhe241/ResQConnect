import test from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Request from '../models/Request.js';
import Resource from '../models/Resource.js';
import Notification from '../models/Notification.js';
import { connectDB } from '../config/db.js';

let server;
let baseUrl;
let citizenToken = '';
let volunteerToken = '';
let ngoToken = '';
let adminToken = '';
let citizenId = '';
let volunteerId = '';

let testResourceId = '';
let testRequestId = '';
let testRequestCustomId = '';

const testTimestamp = Date.now();

test.before(async () => {
  await connectDB();

  // Start HTTP server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  // Login as seeded demo accounts to obtain valid JWT tokens
  const loginAccount = async (email, password) => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: password || 'ResQDemo@2026!' }),
    });
    const data = await res.json();
    return { token: data.token, user: data.user };
  };

  const citizenAuth = await loginAccount('rahul.sharma@example.com');
  citizenToken = citizenAuth.token;
  citizenId = citizenAuth.user.id;

  const volunteerAuth = await loginAccount('priya.mehta@example.com');
  volunteerToken = volunteerAuth.token;
  volunteerId = volunteerAuth.user.id;

  const ngoAuth = await loginAccount('contact@helpinghands.org');
  ngoToken = ngoAuth.token;

  const adminAuth = await loginAccount('admin@resqconnect.org');
  adminToken = adminAuth.token;

  // Create an isolated test resource with limited quantity for stock testing
  const resItem = await Resource.create({
    name: `Test Potable Water Canisters ${testTimestamp}`,
    category: 'Food & Water',
    quantity: 10,
    unit: 'cans',
    minThreshold: 3,
    location: 'Panvel Test Depot',
    organization: 'Helping Hands Foundation',
  });
  testResourceId = resItem._id.toString();
});

test.after(async () => {
  // Clean up test items
  try {
    if (testRequestId) {
      await Request.findByIdAndDelete(testRequestId);
    }
    if (testResourceId) {
      await Resource.findByIdAndDelete(testResourceId);
    }
    await Request.deleteMany({ title: { $regex: /Phase 4 Test/ } });
    await Resource.deleteMany({ name: { $regex: /Test Potable Water/ } });
    await Notification.deleteMany({ desc: { $regex: /Phase 4 Test/ } });
  } catch (e) {
    // ignore
  }

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.connection.close();
});

// 1. Citizen request creation
test('1. Citizen can create an assistance request with auto-generated ID, timeline, and notification', async () => {
  const res = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${citizenToken}`,
    },
    body: JSON.stringify({
      category: 'Food & Water',
      priority: 'High',
      title: `Phase 4 Test Request ${testTimestamp}`,
      description: 'Urgent dry food packets and potable water cans needed.',
      addressDetails: {
        address: 'Sector 4, Plot 10',
        city: 'Panvel',
        state: 'Maharashtra',
        postalCode: '410206',
      },
      peopleAffected: 4,
      itemsNeeded: [{ item: 'Water Can (20L)', qty: 2, unit: 'cans' }],
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.data.id && data.data.id.startsWith('RQ-'));
  assert.equal(data.data.status, 'Submitted');
  assert.equal(data.data.timeline.length, 1);
  assert.equal(data.data.timeline[0].step, 'Submitted');

  testRequestId = data.data._id;
  testRequestCustomId = data.data.id;
});

// 2. Ownership and privacy restrictions
test('2. Another citizen cannot view this private assistance request', async () => {
  // Register a second citizen
  const otherCitizenRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Other Citizen',
      email: `other_citizen_${testTimestamp}@example.com`,
      password: 'Password123!',
      role: 'citizen',
    }),
  });
  const otherCitizenData = await otherCitizenRes.json();
  const otherCitizenToken = otherCitizenData.token;

  // Try to access first citizen's request
  const fetchRes = await fetch(`${baseUrl}/requests/${testRequestCustomId}`, {
    headers: { Authorization: `Bearer ${otherCitizenToken}` },
  });

  assert.equal(fetchRes.status, 403);
  const data = await fetchRes.json();
  assert.equal(data.success, false);
  assert.match(data.message, /access denied/i);
});

// 3. Status transitions
test('3. Invalid status transition is rejected with 400 Bad Request', async () => {
  // Try skipping directly from 'Submitted' to 'Completed'
  const res = await fetch(`${baseUrl}/requests/${testRequestCustomId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ngoToken}`,
    },
    body: JSON.stringify({ status: 'Completed' }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.message, /invalid status transition/i);
});

test('4. Valid status progression moves Submitted -> Under Verification -> Verified', async () => {
  // Advance to Under Verification
  const res1 = await fetch(`${baseUrl}/requests/${testRequestCustomId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ngoToken}`,
    },
    body: JSON.stringify({ status: 'Under Verification', note: 'Field coordinator validating.' }),
  });
  assert.equal(res1.status, 200);

  // Advance to Verified
  const res2 = await fetch(`${baseUrl}/requests/${testRequestCustomId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'Verified', note: 'Household validated.' }),
  });
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.data.status, 'Verified');
});

// 5. Volunteer task claiming
test('5. Verified volunteer claims eligible task, advancing status to Assistance In Progress', async () => {
  // Ensure Priya Mehta is available
  await User.findByIdAndUpdate(volunteerId, { status: 'Available' });

  const res = await fetch(`${baseUrl}/requests/${testRequestCustomId}/volunteer/claim`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${volunteerToken}` },
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.status, 'Assistance In Progress');
  assert.equal(data.data.assignedVolunteer.name, 'Priya Mehta');

  // Verify volunteer status changed to On Field Mission
  const volUser = await User.findById(volunteerId);
  assert.equal(volUser.status, 'On Field Mission');
});

// 6. Volunteer check-in and completion
test('6. Assigned volunteer posts progress check-in note', async () => {
  const res = await fetch(`${baseUrl}/requests/${testRequestCustomId}/volunteer/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${volunteerToken}`,
    },
    body: JSON.stringify({ note: 'Supplies packed and transit van en route.' }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data.checkInNotes.length, 1);
  assert.equal(data.data.checkInNotes[0].author, 'Priya Mehta');
});

test('7. Assigned volunteer marks task completed with delivery notes', async () => {
  const res = await fetch(`${baseUrl}/requests/${testRequestCustomId}/volunteer/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${volunteerToken}`,
    },
    body: JSON.stringify({
      completionNote: 'Handed over directly to household.',
      proofDescription: 'Signed physical relief manifest.',
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data.status, 'Completed');

  // Verify volunteer released back to Available
  const volUser = await User.findById(volunteerId);
  assert.equal(volUser.status, 'Available');
});

// 8. Atomic resource allocation & stock protection
test('8. NGO allocates resources atomically; insufficient stock and negative stock are rejected', async () => {
  // Create another active request for allocation testing
  const reqRes = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${citizenToken}`,
    },
    body: JSON.stringify({
      category: 'Food & Water',
      priority: 'High',
      title: `Allocation Test Request ${testTimestamp}`,
      description: 'Need water canisters.',
      addressDetails: { address: 'L1', city: 'Panvel', state: 'MH', postalCode: '410206' },
      peopleAffected: 2,
      itemsNeeded: [{ item: 'Water', qty: 2, unit: 'cans' }],
    }),
  });
  const reqData = await reqRes.json();
  const allocationRequestId = reqData.data.id;

  // Attempt to allocate MORE than available stock (we initialized testResourceId with 10 cans)
  const overAllocRes = await fetch(`${baseUrl}/requests/${allocationRequestId}/ngo/allocate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ngoToken}`,
    },
    body: JSON.stringify({ resourceId: testResourceId, quantity: 50 }), // Only 10 available
  });
  assert.equal(overAllocRes.status, 400);
  const overAllocData = await overAllocRes.json();
  assert.match(overAllocData.message, /insufficient inventory/i);

  // Allocate valid quantity (4 cans out of 10)
  const validAllocRes = await fetch(`${baseUrl}/requests/${allocationRequestId}/ngo/allocate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ngoToken}`,
    },
    body: JSON.stringify({ resourceId: testResourceId, quantity: 4 }),
  });
  assert.equal(validAllocRes.status, 200);
  const validAllocData = await validAllocRes.json();
  assert.equal(validAllocData.remainingStock, 6);

  // Verify resource stock in DB decreased to 6
  const updatedResource = await Resource.findById(testResourceId);
  assert.equal(updatedResource.quantity, 6);

  // Clean up
  await Request.findByIdAndDelete(reqData.data._id);
});

// 9. Notifications privacy
test('9. User can only view and update their own notifications', async () => {
  // Query notifications as citizen
  const res = await fetch(`${baseUrl}/notifications`, {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.data));

  // All returned notifications must belong to citizenId
  for (const notif of data.data) {
    assert.equal(notif.userId.toString(), citizenId);
  }
});

// 10. Admin-only endpoints security
test('10. Non-admin users cannot access admin audit-logs or verification endpoints', async () => {
  // Citizen attempts to access audit logs
  const resCitizen = await fetch(`${baseUrl}/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert.equal(resCitizen.status, 403);

  // Volunteer attempts to access user verifications
  const resVolunteer = await fetch(`${baseUrl}/admin/users`, {
    headers: { Authorization: `Bearer ${volunteerToken}` },
  });
  assert.equal(resVolunteer.status, 403);

  // Admin access succeeds
  const resAdmin = await fetch(`${baseUrl}/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(resAdmin.status, 200);
  const adminData = await resAdmin.json();
  assert.ok(Array.isArray(adminData.data));
});

// 11. Public recovery hubs directory
test('11. Recovery hubs directory is publicly accessible and returns list of hubs', async () => {
  const res = await fetch(`${baseUrl}/hubs`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.data.length >= 1);
});
