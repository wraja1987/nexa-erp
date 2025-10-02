import request from 'supertest';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
describe('/api/kpi/dashboard contract', () => {
  it('GET returns required numeric fields', async () => {
    const res = await request(base).get('/api/kpi/dashboard').expect(200);
    const body = res.body || {};
    for (const k of ['totalRevenue', 'arBalance', 'apBalance', 'ordersToday']) {
      expect(typeof body[k]).toBe('number');
    }
  });
});




