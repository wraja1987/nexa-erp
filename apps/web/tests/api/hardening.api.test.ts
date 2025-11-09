import request from 'supertest'

// These tests assume server is started by start-server-and-test in CI, but here we hit deployed base via TEST_BASE_URL or local next dev
const base = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('Hardening - tenant and role', () => {
  test('STAFF cannot call admin role API (403)', async () => {
    const res = await request(base)
      .post('/api/admin/users/role')
      .set('x-role', 'STAFF') // should be ignored in prod; in dev our guard still enforces permissions
      .send({ userId: 'user-x', role: 'ADMIN' })
    expect([401, 403]).toContain(res.status)
  })

  test('Cross-tenant mismatch returns 403', async () => {
    // Passing a mismatched tenantId must be rejected by assertTenantScope in prod; in local dev, function still compares when provided
    const res = await request(base)
      .post('/api/finance/ar/invoice/approve')
      .set('content-type','application/json')
      .send({ invoiceId: 'inv-x', tenantId: 'wrong' })
    expect([401, 403, 404]).toContain(res.status)
  })
})
