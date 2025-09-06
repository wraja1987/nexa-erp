# Nexa ERP — Phase 05: Sales & CRM (Leads, Opportunities, Quotes, Sales Orders, Returns, CRM Integrations, Marketplace) — Audit Summary
- Time: 2025-09-06 11:20:53 BST
- Root: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend

## Tail of results

·····stdout | apps/web/src/app/api/billing/webhook/status/route.test.ts > billing webhook status > responds 200 with configured flag
[assistant_audit] {
  route: [32m'/api/billing/webhook/status'[39m,
  configured: [33mfalse[39m,
  hasMasked: [33mtrue[39m
}

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

····stdout | apps/web/src/app/api/integrations/shopify/status/route.test.ts > shopify status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/shopify/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

··············stdout | apps/web/src/app/api/integrations/health/route.test.ts > integrations health DTO > honors enable flags env
[assistant_audit] {
  route: [32m'/api/integrations/health'[39m,
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

·stdout | apps/web/src/app/api/enterprise/demo/route.test.ts > enterprise demo route > returns counts from demo file
[assistant_audit] {
  route: [32m'/api/enterprise/demo'[39m,
  session: [32m'demo'[39m,
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

··stdout | apps/web/src/app/api/integrations/ebay/status/route.test.ts > ebay status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/ebay/status'[39m,
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

··stdout | apps/web/src/app/api/integrations/amazon/status/route.test.ts > amazon status > responds 200 with JSON
[assistant_audit] {
  route: [32m'/api/integrations/amazon/status'[39m,
  session: [32m'heal****'[39m,
  ip: [32m'0.xxx.xxx.xxx'[39m,
  hasMasked: [33mtrue[39m
}

······stdout | apps/web/src/app/api/crm/hubspot/status/route.test.ts > hubspot status > responds 200 with configured flag
[assistant_audit] {
  route: [32m'/api/crm/hubspot/status'[39m,
  configured: [33mfalse[39m,
  hasMasked: [33mtrue[39m
}

·······························

 Test Files  47 passed (47)
      Tests  98 passed (98)
   Start at  11:20:51
   Duration  2.51s (transform 615ms, setup 130ms, collect 4.09s, tests 1.34s, environment 7ms, prepare 4.76s)


> Full raw log: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend/reports/phase-05-Sales_&_CRM_(Leads,_Opportunities,_Quotes,_Sales_Orders,_Returns,_CRM_Integrations,_Marketplace)-20250906111957.log
