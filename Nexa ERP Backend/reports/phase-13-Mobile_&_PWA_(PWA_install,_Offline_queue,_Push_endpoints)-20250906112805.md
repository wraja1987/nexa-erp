# Nexa ERP — Phase 13: Mobile & PWA (PWA install, Offline queue, Push endpoints) — Audit Summary
- Time: 2025-09-06 11:50:16 BST
- Root: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend

## Tail of results
[assistant_audit] {
  route: [32m'/api/integrations/open-banking/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

········stdout | apps/web/src/app/api/integrations/amazon/status/route.test.ts > amazon status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/amazon/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/pos/stripe/webhook/route.test.ts > pos stripe webhook signature verification and idempotency
[POS AUDIT] {
  at: [32m'2025-09-06T10:32:33.009Z'[39m,
  route: [32m'/api/pos/stripe/webhook'[39m,
  eventType: [32m'payment_intent.succeeded'[39m
}

stdout | apps/web/src/app/api/pos/stripe/webhook/route.test.ts > pos stripe webhook signature verification and idempotency
[POS AUDIT] {
  at: [32m'2025-09-06T10:32:33.012Z'[39m,
  route: [32m'/api/pos/stripe/webhook'[39m,
  eventType: [32m'payment_intent.succeeded'[39m,
  status: [32m'duplicate_ignored'[39m
}

·stdout | apps/web/src/app/api/integrations/edi/status/route.test.ts > edi status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/edi/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/billing/webhook/status/route.test.ts > billing webhook status > responds 200 with configured flag
[assistant_audit] {
  route: [32m'/api/billing/webhook/status'[39m,
  configured: [33mfalse[39m,
  hasMasked: [33mtrue[39m
}

·stdout | apps/web/src/app/api/integrations/health/route.test.ts > integrations health DTO > honors enable flags env
[assistant_audit] {
  route: [32m'/api/integrations/health'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

·················stdout | apps/web/src/app/api/orchestration/runs/route.test.ts > orchestration runs API > lists queued runs
[assistant_audit] {
  route: [32m'/api/orchestration/runs'[39m,
  count: [33m1[39m,
  total: [33m1[39m,
  status: [32m'all'[39m,
  hasMasked: [33mtrue[39m
}

stdout | apps/web/src/app/api/orchestration/runs/route.test.ts > orchestration runs API > completes a run via POST
[assistant_audit] {
  route: [32m'/api/orchestration/runs'[39m,
  action: [32m'complete'[39m,
  id: [32m'orc_e4p7m46781q'[39m,
  hasMasked: [33mtrue[39m
}

stdout | apps/web/src/app/api/orchestration/runs/route.test.ts > orchestration runs API > completes a run via POST
[assistant_audit] {
  route: [32m'/api/orchestration/runs'[39m,
  count: [33m1[39m,
  total: [33m1[39m,
  status: [32m'completed'[39m,
  hasMasked: [33mtrue[39m
}

····stdout | apps/web/src/app/api/orchestration/queue/route.test.ts > orchestration queue API > returns queued count
[assistant_audit] { route: [32m'/api/orchestration/queue'[39m, queued: [33m1[39m, hasMasked: [33mtrue[39m }

···stdout | apps/web/src/app/api/enterprise/demo/route.test.ts > enterprise demo route > returns counts from demo file
[assistant_audit] {
  route: [32m'/api/enterprise/demo'[39m,
  session: [32m'demo'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

···stdout | apps/web/src/app/api/crm/hubspot/status/route.test.ts > hubspot status > responds 200 with configured flag
[assistant_audit] {
  route: [32m'/api/crm/hubspot/status'[39m,
  configured: [33mfalse[39m,
  hasMasked: [33mtrue[39m
}

·············stdout | apps/web/src/__tests__/connectors.mock.test.ts > mockConnectorService > connects and disconnects
[assistant_audit] {
  route: [32m'/settings/connectors'[39m,
  action: [32m'connect'[39m,
  key: [32m'google'[39m,
  hasMasked: [33mtrue[39m
}

stdout | apps/web/src/__tests__/connectors.mock.test.ts > mockConnectorService > connects and disconnects
[assistant_audit] {
  route: [32m'/settings/connectors'[39m,
  action: [32m'disconnect'[39m,
  key: [32m'google'[39m,
  hasMasked: [33mtrue[39m
}

·················

 Test Files  47 passed (47)
      Tests  98 passed (98)
   Start at  11:32:30
   Duration  3.63s (transform 740ms, setup 149ms, collect 5.66s, tests 974ms, environment 7ms, prepare 8.04s)


> Full raw log: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend/reports/phase-13-Mobile_&_PWA_(PWA_install,_Offline_queue,_Push_endpoints)-20250906112805.log
