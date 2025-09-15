# Nexa ERP — Phase 00: Pre-Build_Audit — Audit Summary
- Time: 2025-09-06 12:50:17 BST
- Root: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend

## Tail of results

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
  id: [32m'orc_2eczptaypxi'[39m,
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

····stdout | apps/web/src/app/api/integrations/amazon/status/route.test.ts > amazon status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/amazon/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

···stdout | apps/web/src/app/api/integrations/hmrc-rti/status/route.test.ts > hmrc-rti status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/hmrc-rti/status'[39m,
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

···stdout | apps/web/src/app/api/billing/webhook/status/route.test.ts > billing webhook status > responds 200 with configured flag
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

··stdout | apps/web/src/app/api/enterprise/demo/route.test.ts > enterprise demo route > returns counts from demo file
[assistant_audit] {
  route: [32m'/api/enterprise/demo'[39m,
  session: [32m'demo'[39m,
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

··stdout | apps/web/src/app/api/crm/hubspot/status/route.test.ts > hubspot status > responds 200 with configured flag
[assistant_audit] {
  route: [32m'/api/crm/hubspot/status'[39m,
  configured: [33mfalse[39m,
  hasMasked: [33mtrue[39m
}

·stdout | apps/web/src/app/api/integrations/ebay/status/route.test.ts > ebay status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/ebay/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

·········stdout | apps/web/src/__tests__/connectors.mock.test.ts > mockConnectorService > connects and disconnects
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

·····································

 Test Files  47 passed (47)
      Tests  98 passed (98)
   Start at  12:50:14
   Duration  2.83s (transform 742ms, setup 121ms, collect 4.63s, tests 1.29s, environment 5ms, prepare 4.38s)


> Full raw log: _Users_waheedraja_Desktop_Business Opportunities_Nexa ERP_Nexa ERP Backend_reports_phase-00-Pre-Build_Audit-20250906124931.log
