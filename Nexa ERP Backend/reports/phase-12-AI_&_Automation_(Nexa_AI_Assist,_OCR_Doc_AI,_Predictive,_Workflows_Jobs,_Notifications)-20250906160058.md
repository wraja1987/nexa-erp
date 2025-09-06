# Nexa ERP — Phase 12: AI & Automation (Nexa AI Assist, OCR/Doc AI, Predictive, Workflows/Jobs, Notifications) — Audit Summary
- Time: 2025-09-06 16:01:56 BST
- Root: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend

## Tail of results
  route: [32m'/api/orchestration/runs'[39m,
  action: [32m'complete'[39m,
  id: [32m'orc_x57e4j8lmt8'[39m,
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

····stdout | apps/web/src/app/api/entities/route.test.ts > entities API > lists entities
[assistant_audit] {
  route: [32m'/api/entities'[39m,
  action: [32m'list'[39m,
  session: [32m'enti****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

stdout | apps/web/src/app/api/entities/route.test.ts > entities API > creates an entity with valid payload
[assistant_audit] {
  route: [32m'/api/entities'[39m,
  action: [32m'create'[39m,
  session: [32m'enti****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

····stdout | apps/web/src/app/api/pos/stripe/webhook/route.test.ts > pos stripe webhook signature verification and idempotency
[POS AUDIT] {
  at: [32m'2025-09-06T15:01:55.179Z'[39m,
  route: [32m'/api/pos/stripe/webhook'[39m,
  eventType: [32m'payment_intent.succeeded'[39m
}

stdout | apps/web/src/app/api/pos/stripe/webhook/route.test.ts > pos stripe webhook signature verification and idempotency
[POS AUDIT] {
  at: [32m'2025-09-06T15:01:55.183Z'[39m,
  route: [32m'/api/pos/stripe/webhook'[39m,
  eventType: [32m'payment_intent.succeeded'[39m,
  status: [32m'duplicate_ignored'[39m
}

···stdout | apps/web/src/app/api/integrations/ebay/status/route.test.ts > ebay status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/ebay/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/integrations/open-banking/status/route.test.ts > open-banking status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/open-banking/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/orchestration/start/route.test.ts > orchestration start DTO > enqueues on POST and returns orchestration id
[assistant_audit] {
  ip: [32m'1.xxx.xxx.xxx'[39m,
  session: [32m'sess****-1'[39m,
  route: [32m'/api/orchestration/start'[39m,
  hasMasked: [33mtrue[39m
}

stdout | apps/web/src/app/api/orchestration/start/route.test.ts > orchestration start DTO > rejects invalid payload with 400
[assistant_audit] {
  ip: [32m'loca****'[39m,
  session: [32m'loca****'[39m,
  route: [32m'/api/orchestration/start'[39m,
  validation: [32m'fail'[39m,
  hasMasked: [33mtrue[39m
}

····stdout | apps/web/src/__tests__/connectors.mock.test.ts > mockConnectorService > connects and disconnects
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

·······stdout | apps/web/src/app/api/integrations/health/route.test.ts > integrations health DTO > honors enable flags env
[assistant_audit] {
  route: [32m'/api/integrations/health'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/enterprise/demo/route.test.ts > enterprise demo route > returns counts from demo file
[assistant_audit] {
  route: [32m'/api/enterprise/demo'[39m,
  session: [32m'demo'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

·······································

 Test Files  47 passed (47)
      Tests  98 passed (98)
   Start at  16:01:53
   Duration  2.68s (transform 751ms, setup 218ms, collect 4.21s, tests 1.13s, environment 5ms, prepare 5.05s)


> Full raw log: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend/reports/phase-12-AI_&_Automation_(Nexa_AI_Assist,_OCR_Doc_AI,_Predictive,_Workflows_Jobs,_Notifications)-20250906160058.log
