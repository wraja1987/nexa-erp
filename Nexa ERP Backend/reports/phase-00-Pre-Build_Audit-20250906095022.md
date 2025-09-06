# Nexa ERP — Phase 00: Pre-Build_Audit — Audit Summary
- Time: 2025-09-06 09:50:54 BST
- Root: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend

## Tail of results
[assistant_audit] {
  ip: [32m'loca****'[39m,
  session: [32m'loca****'[39m,
  route: [32m'/api/orchestration/start'[39m,
  validation: [32m'fail'[39m,
  hasMasked: [33mtrue[39m
}

stdout | apps/web/src/app/api/po/orders/route.test.ts > po orders API > lists POs
[assistant_audit] { route: [32m'/api/po/orders'[39m, action: [32m'list'[39m, hasMasked: [33mtrue[39m }

······stdout | apps/web/src/app/api/integrations/open-banking/status/route.test.ts > open-banking status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/open-banking/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

·······stdout | apps/web/src/app/api/integrations/shopify/status/route.test.ts > shopify status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/shopify/status'[39m,
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

··stdout | apps/web/src/app/api/integrations/health/route.test.ts > integrations health DTO > honors enable flags env
[assistant_audit] {
  route: [32m'/api/integrations/health'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
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

····stdout | apps/web/src/app/api/orchestration/runs/route.test.ts > orchestration runs API > lists queued runs
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
  id: [32m'orc_1dhczqpzxzqi'[39m,
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

··········stdout | apps/web/src/app/api/integrations/amazon/status/route.test.ts > amazon status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/amazon/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/orchestration/queue/route.test.ts > orchestration queue API > returns queued count
[assistant_audit] { route: [32m'/api/orchestration/queue'[39m, queued: [33m1[39m, hasMasked: [33mtrue[39m }

·stdout | apps/web/src/app/api/integrations/edi/status/route.test.ts > edi status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/edi/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

········stdout | apps/web/src/app/api/integrations/hmrc-rti/status/route.test.ts > hmrc-rti status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/hmrc-rti/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

······················

 Test Files  13 failed | 34 passed (47)
      Tests  16 failed | 82 passed (98)
   Start at  09:50:52
   Duration  2.61s (transform 575ms, setup 215ms, collect 4.06s, tests 1.42s, environment 11ms, prepare 4.72s)

 ELIFECYCLE  Test failed. See above for more details.

> Full raw log: reports/phase-00-Pre-Build_Audit-20250906095022.log
