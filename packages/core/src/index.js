const { z } = require('zod');

const AiGovernanceDefaults = Object.freeze({
  regulatedSubmit: false,
  tokenCap: 8000,
});

function enforceTenantScope(ctx, record) {
  if (!record) return null;
  return record.tenant_id === ctx.tenantId ? record : null;
}

function assertSoD(ctx, action) {
  if ((action === 'CHANGE_SUBSCRIPTION' || action === 'MODIFY_PLAN') && ctx.userRole !== 'SUPER_ADMIN') {
    throw new Error('SoD: Only Super Admin can change subscriptions, quotas, or plans.');
  }
}

const OpenApiStub = z.object({
  openapi: z.literal('3.1.0'),
  info: z.object({ title: z.string(), version: z.string() }),
  paths: z.record(z.any()),
});

function compileOpenApi() {
  const doc = { openapi: '3.1.0', info: { title: 'Nexa API', version: '0.0.0' }, paths: {} };
  OpenApiStub.parse(doc);
  return true;
}

module.exports = {
  AiGovernanceDefaults,
  enforceTenantScope,
  assertSoD,
  OpenApiStub,
  compileOpenApi,
};
