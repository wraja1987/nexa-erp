import request from 'supertest';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
describe('/api/modules contract', () => {
  it('GET /api/modules?tree=1 returns array with string name fields', async () => {
    const res = await request(base).get('/api/modules?tree=1').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    for (const node of res.body) {
      expect(typeof node.name).toBe('string');
      expect(node.name.length).toBeGreaterThan(0);
    }
  });
});




