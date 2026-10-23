import { test, expect } from '@playwright/test';

const BACKEND_BASE = process.env.LIVE_BACKEND_URL || 'https://final-resqconnect-project.onrender.com/api';

test.describe('Live Backend API Verification Suite', () => {

  test('1. GET /api/health confirms service operational and database.connected is true', async ({ request }) => {
    const res = await request.get(`${BACKEND_BASE}/health`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.status).toBe('healthy');
    expect(body.database).toBeDefined();
    expect(body.database.connected).toBe(true);
    expect(body.database.status).toBe('connected');
  });

  test('2. POST /api/auth/login rejects invalid credentials safely', async ({ request }) => {
    const res = await request.post(`${BACKEND_BASE}/auth/login`, {
      data: {
        email: 'invalid.test.user@example.com',
        password: 'IncorrectPassword123!',
      },
    });

    // In production: 401 for invalid credentials or 429 if throttled by security rate-limiter
    expect([401, 429]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('3. Unauthorized access to protected /api/auth/me returns 401', async ({ request }) => {
    const res = await request.get(`${BACKEND_BASE}/auth/me`);
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('4. Unauthorized access to administrative endpoint /api/admin/users returns 401', async ({ request }) => {
    const res = await request.get(`${BACKEND_BASE}/admin/users`);
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('5. Unauthorized access to administrative endpoint /api/admin/audit-logs returns 401', async ({ request }) => {
    const res = await request.get(`${BACKEND_BASE}/admin/audit-logs`);
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('6. Unauthorized access to notifications endpoint /api/notifications returns 401', async ({ request }) => {
    const res = await request.get(`${BACKEND_BASE}/notifications`);
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('7. POST /api/auth/register rejects missing required fields safely', async ({ request }) => {
    const res = await request.post(`${BACKEND_BASE}/auth/register`, {
      data: {},
    });

    expect([400, 429]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('8. POST /api/auth/register rejects password shorter than 6 characters safely', async ({ request }) => {
    const res = await request.post(`${BACKEND_BASE}/auth/register`, {
      data: {
        name: 'Validation Test',
        email: 'shortpass@example.com',
        password: '123',
      },
    });

    expect([400, 429]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('9. POST /api/auth/register rejects public administrative registration safely', async ({ request }) => {
    const res = await request.post(`${BACKEND_BASE}/auth/register`, {
      data: {
        name: 'Malicious Admin Registration Attempt',
        email: 'intruder@example.com',
        password: 'StrongPassword123!',
        role: 'admin',
      },
    });

    expect([403, 429]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('10. POST /api/auth/demo-switch is permanently disabled in production mode with 403 Forbidden', async ({ request }) => {
    const res = await request.post(`${BACKEND_BASE}/auth/demo-switch`, {
      data: { role: 'admin' },
    });

    // In production, demo-switch MUST return 403
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/disabled in production/i);
  });

  test('11. GET /api/hubs is publicly accessible and returns disaster recovery hubs list', async ({ request }) => {
    const res = await request.get(`${BACKEND_BASE}/hubs`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });
});
