# Nexa ERP — Phase 00: Pre-Build_Audit — Audit Summary
- Time: 2025-09-06 09:57:06 BST
- Root: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend

## Tail of results
}

··stdout | apps/web/src/app/api/orchestration/runs/route.test.ts > orchestration runs API > lists queued runs
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
  id: [32m'orc_dsj8sto24r4'[39m,
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

····stdout | apps/web/src/app/api/integrations/ebay/status/route.test.ts > ebay status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/ebay/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

·······stdout | apps/web/src/app/api/entities/route.test.ts > entities API > lists entities
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

·········stdout | apps/web/src/app/api/integrations/edi/status/route.test.ts > edi status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/edi/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

······stdout | apps/web/src/app/api/orchestration/queue/route.test.ts > orchestration queue API > returns queued count
[assistant_audit] { route: [32m'/api/orchestration/queue'[39m, queued: [33m1[39m, hasMasked: [33mtrue[39m }

····stdout | apps/web/src/app/api/integrations/open-banking/status/route.test.ts > open-banking status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/open-banking/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

······stdout | apps/web/src/app/api/billing/webhook/status/route.test.ts > billing webhook status > responds 200 with configured flag
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

··stdout | apps/web/src/app/api/integrations/amazon/status/route.test.ts > amazon status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/amazon/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

············stdout | apps/web/src/__tests__/connectors.mock.test.ts > mockConnectorService > connects and disconnects
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

·······················

 Test Files  1 failed | 46 passed (47)
      Tests  1 failed | 97 passed (98)
   Start at  09:57:03
   Duration  2.64s (transform 614ms, setup 116ms, collect 4.10s, tests 1.37s, environment 9ms, prepare 4.93s)

 ELIFECYCLE  Test failed. See above for more details.

> Full raw log: reports/phase-00-Pre-Build_Audit-20250906095632.log
