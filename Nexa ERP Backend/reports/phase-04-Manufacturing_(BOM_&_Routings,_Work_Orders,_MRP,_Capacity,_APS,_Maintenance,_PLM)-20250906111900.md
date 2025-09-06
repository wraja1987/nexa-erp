# Nexa ERP — Phase 04: Manufacturing (BOM & Routings, Work Orders, MRP, Capacity, APS, Maintenance, PLM) — Audit Summary
- Time: 2025-09-06 11:19:57 BST
- Root: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend

## Tail of results
[assistant_audit] {
  ip: [32m'1.xxx.xxx.xxx'[39m,
  session: [32m'1.xxx.xxx.xxx'[39m,
  route: [32m'/x'[39m,
  hasMasked: [33mtrue[39m
}

stdout | apps/web/src/app/api/assistant/route.test.ts > assistant route > rate limits excessive calls
[assistant_audit] {
  ip: [32m'1.xxx.xxx.xxx'[39m,
  session: [32m'1.xxx.xxx.xxx'[39m,
  route: [32m'/x'[39m,
  hasMasked: [33mtrue[39m
}

stdout | apps/web/src/app/api/assistant/route.test.ts > assistant route > enforces token budget per session
[assistant_audit] { ip: [32m'1.xxx.xxx.xxx'[39m, session: [32m's1'[39m, route: [32m'/x'[39m, hasMasked: [33mtrue[39m }

stdout | apps/web/src/app/api/assistant/route.test.ts > assistant route > enforces token budget per session
[assistant_audit] { ip: [32m'1.xxx.xxx.xxx'[39m, session: [32m's1'[39m, route: [32m'/x'[39m, hasMasked: [33mtrue[39m }

···stdout | apps/web/src/app/api/orchestration/queue/route.test.ts > orchestration queue API > returns queued count
[assistant_audit] { route: [32m'/api/orchestration/queue'[39m, queued: [33m1[39m, hasMasked: [33mtrue[39m }

·stdout | apps/web/src/app/api/entities/route.test.ts > entities API > lists entities
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

·····stdout | apps/web/src/app/api/integrations/open-banking/status/route.test.ts > open-banking status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/open-banking/status'[39m,
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

···stdout | apps/web/src/app/api/billing/webhook/status/route.test.ts > billing webhook status > responds 200 with configured flag
[assistant_audit] {
  route: [32m'/api/billing/webhook/status'[39m,
  configured: [33mfalse[39m,
  hasMasked: [33mtrue[39m
}

·stdout | apps/web/src/app/api/integrations/edi/status/route.test.ts > edi status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/edi/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

···················stdout | apps/web/src/app/api/integrations/amazon/status/route.test.ts > amazon status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/amazon/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··stdout | apps/web/src/app/api/integrations/shopify/status/route.test.ts > shopify status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/shopify/status'[39m,
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

·····stdout | apps/web/src/__tests__/connectors.mock.test.ts > mockConnectorService > connects and disconnects
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

··························

 Test Files  47 passed (47)
      Tests  98 passed (98)
   Start at  11:19:54
   Duration  2.57s (transform 555ms, setup 150ms, collect 4.05s, tests 1.19s, environment 5ms, prepare 5.03s)


> Full raw log: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend/reports/phase-04-Manufacturing_(BOM_&_Routings,_Work_Orders,_MRP,_Capacity,_APS,_Maintenance,_PLM)-20250906111900.log
