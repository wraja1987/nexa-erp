# Nexa ERP — Phase 02: Finance (GL, AP, AR, Bank & Cash, Reconciliation, VAT, Fixed Assets, Period Close, FX, Costing) — Audit Summary
- Time: 2025-09-06 10:54:57 BST
- Root: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend

## Tail of results
[assistant_audit] {
  route: [32m'/api/entities'[39m,
  action: [32m'create'[39m,
  session: [32m'enti****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

·····stdout | apps/web/src/app/api/enterprise/demo/route.test.ts > enterprise demo route > returns counts from demo file
[assistant_audit] {
  route: [32m'/api/enterprise/demo'[39m,
  session: [32m'demo'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/billing/webhook/status/route.test.ts > billing webhook status > responds 200 with configured flag
[assistant_audit] {
  route: [32m'/api/billing/webhook/status'[39m,
  configured: [33mfalse[39m,
  hasMasked: [33mtrue[39m
}

·stdout | apps/web/src/app/api/integrations/shopify/status/route.test.ts > shopify status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/shopify/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

···stdout | apps/web/src/app/api/integrations/open-banking/status/route.test.ts > open-banking status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/open-banking/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

·····stdout | apps/web/src/app/api/orchestration/queue/route.test.ts > orchestration queue API > returns queued count
[assistant_audit] { route: [32m'/api/orchestration/queue'[39m, queued: [33m1[39m, hasMasked: [33mtrue[39m }

···stdout | apps/web/src/app/api/integrations/amazon/status/route.test.ts > amazon status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/amazon/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/pos/stripe/webhook/route.test.ts > pos stripe webhook signature verification and idempotency
[POS AUDIT] {
  at: [32m'2025-09-06T09:54:56.895Z'[39m,
  route: [32m'/api/pos/stripe/webhook'[39m,
  eventType: [32m'payment_intent.succeeded'[39m
}

stdout | apps/web/src/app/api/pos/stripe/webhook/route.test.ts > pos stripe webhook signature verification and idempotency
[POS AUDIT] {
  at: [32m'2025-09-06T09:54:56.900Z'[39m,
  route: [32m'/api/pos/stripe/webhook'[39m,
  eventType: [32m'payment_intent.succeeded'[39m,
  status: [32m'duplicate_ignored'[39m
}

········stdout | apps/web/src/app/api/integrations/edi/status/route.test.ts > edi status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/edi/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/integrations/hmrc-rti/status/route.test.ts > hmrc-rti status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/hmrc-rti/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

stdout | apps/web/src/app/api/integrations/ebay/status/route.test.ts > ebay status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/ebay/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

····stdout | apps/web/src/app/api/integrations/health/route.test.ts > integrations health DTO > honors enable flags env
[assistant_audit] {
  route: [32m'/api/integrations/health'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

······················stdout | apps/web/src/__tests__/connectors.mock.test.ts > mockConnectorService > connects and disconnects
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

················

 Test Files  47 passed (47)
      Tests  98 passed (98)
   Start at  10:54:55
   Duration  2.48s (transform 579ms, setup 166ms, collect 3.96s, tests 1.20s, environment 5ms, prepare 4.78s)


> Full raw log: reports/phase-02-Finance_(GL,_AP,_AR,_Bank_&_Cash,_Reconciliation,_VAT,_Fixed_Assets,_Period_Close,_FX,_Costing)-20250906105401.log
