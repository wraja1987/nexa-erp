# Nexa ERP — Phase 02: Finance (GL, AP, AR, Bank & Cash, Reconciliation, VAT, Fixed Assets, Period Close, FX, Costing) — Audit Summary
- Time: 2025-09-06 11:18:04 BST
- Root: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend

## Tail of results
}

····stdout | apps/web/src/app/api/integrations/ebay/status/route.test.ts > ebay status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/ebay/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/integrations/edi/status/route.test.ts > edi status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/edi/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/pos/stripe/webhook/route.test.ts > pos stripe webhook signature verification and idempotency
[POS AUDIT] {
  at: [32m'2025-09-06T10:18:02.792Z'[39m,
  route: [32m'/api/pos/stripe/webhook'[39m,
  eventType: [32m'payment_intent.succeeded'[39m
}

stdout | apps/web/src/app/api/pos/stripe/webhook/route.test.ts > pos stripe webhook signature verification and idempotency
[POS AUDIT] {
  at: [32m'2025-09-06T10:18:02.811Z'[39m,
  route: [32m'/api/pos/stripe/webhook'[39m,
  eventType: [32m'payment_intent.succeeded'[39m,
  status: [32m'duplicate_ignored'[39m
}

·stdout | apps/web/src/app/api/orchestration/start/route.test.ts > orchestration start DTO > enqueues on POST and returns orchestration id
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

····stdout | apps/web/src/app/api/enterprise/demo/route.test.ts > enterprise demo route > returns counts from demo file
[assistant_audit] {
  route: [32m'/api/enterprise/demo'[39m,
  session: [32m'demo'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

·····stdout | apps/web/src/app/api/integrations/open-banking/status/route.test.ts > open-banking status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/open-banking/status'[39m,
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

···stdout | apps/web/src/__tests__/connectors.mock.test.ts > mockConnectorService > connects and disconnects
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

···········stdout | apps/web/src/app/api/integrations/health/route.test.ts > integrations health DTO > honors enable flags env
[assistant_audit] {
  route: [32m'/api/integrations/health'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/crm/hubspot/status/route.test.ts > hubspot status > responds 200 with configured flag
[assistant_audit] {
  route: [32m'/api/crm/hubspot/status'[39m,
  configured: [33mfalse[39m,
  hasMasked: [33mtrue[39m
}

···········stdout | apps/web/src/app/api/integrations/amazon/status/route.test.ts > amazon status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/amazon/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

·······················

 Test Files  47 passed (47)
      Tests  98 passed (98)
   Start at  11:18:01
   Duration  2.50s (transform 636ms, setup 128ms, collect 4.25s, tests 1.18s, environment 7ms, prepare 4.87s)


> Full raw log: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend/reports/phase-02-Finance_(GL,_AP,_AR,_Bank_&_Cash,_Reconciliation,_VAT,_Fixed_Assets,_Period_Close,_FX,_Costing)-20250906111707.log
