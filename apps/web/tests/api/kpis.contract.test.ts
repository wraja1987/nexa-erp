import request from 'supertest';
import { z } from 'zod';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

const respSchema = z.object({
  tenantId: z.string(),
  series: z.array(z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/),
    invoicesTotal: z.number(),
    billsTotal: z.number(),
    receiptsTotal: z.number(),
    posTotal: z.number(),
    payrollTotal: z.number(),
  })),
  totals: z.object({
    invoicesTotal: z.number(),
    billsTotal: z.number(),
    receiptsTotal: z.number(),
    posTotal: z.number(),
    payrollTotal: z.number(),
  }),
});

describe('KPI API contract', () => {
  it('shape stable and months clamped 1..24', async () => {
    const agent = request.agent(BASE);
    const csrfRes = await agent.get('/api/auth/csrf');
    const csrf = csrfRes.body.csrfToken;
    await agent.post('/api/auth/callback/credentials').type('form').send({ csrfToken: csrf, email: 'info@nexaai.co.uk', password: 'NexaSuper!123' }).redirects(0);

    const r12 = await agent.get('/api/dashboard/kpis?months=12').expect(200);
    expect(respSchema.safeParse(r12.body).success).toBe(true);
    expect(r12.body.series.length).toBe(12);

    const rClamp = await agent.get('/api/dashboard/kpis?months=999').expect(200);
    expect(rClamp.body.series.length).toBe(24);

    await agent.get('/api/dashboard/kpis?months=abc').expect(400);
  });
});


