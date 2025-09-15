import { test, expect, request } from '@playwright/test'

test('inventory receipt -> issue FIFO with optional GL posting', async ({ request }) => {
  const rec = await request.post('/api/inventory/movements', { data: { tenantId:'t1', sku:'SKU-E2E', qty:10, type:'receipt', costMethod:'FIFO', unitCost:5 } })
  expect(rec.ok()).toBeTruthy()
  const iss = await request.post('/api/inventory/movements', { data: { tenantId:'t1', sku:'SKU-E2E', qty:4, type:'issue', costMethod:'FIFO', glDebit:'acc-debit', glCredit:'acc-credit' } })
  expect(iss.ok()).toBeTruthy()
})

test('FX revaluation compute', async ({ request }) => {
  const res = await request.post('/api/finance/fx/revalue', { data: { tenantId:'t1', accountId:'acc', balance:100, from:'GBP', to:'GBP' } })
  expect(res.ok()).toBeTruthy()
})

test('VAT compute (GL-backed)', async ({ request }) => {
  const res = await request.post('/api/tax/vat/compute', { data: { tenantId:'t1', start: '2025-01-01', end: '2025-12-31' } })
  expect(res.ok()).toBeTruthy()
})






