Grafana Import & Read-only User
-------------------------------

1) Open Grafana: http://localhost:3002 and login (admin/admin or configured env).
2) Import dashboard: Dashboards > Import > Upload `ops/dashboards/nexa-slo-overview.json`.
3) Create read-only user:
   - Administration > Users > New user
   - Username: nexa-readonly, Role: Viewer, set password
4) Snapshot:
   - Open the dashboard > Share > Snapshot > Remove sensitive data > Generate & Download
   - Save file to `ops/dashboards/snapshots/nexa-slo-overview-<timestamp>.json`

API (optional): set `GRAFANA_TOKEN` env with Admin API token.
Examples:
```
# Import dashboard
curl -s -H "Authorization: Bearer $GRAFANA_TOKEN" -H 'Content-Type: application/json' \
  -X POST http://localhost:3002/api/dashboards/db \
  --data-binary @ops/dashboards/nexa-slo-overview.json

# Create user (Viewer)
curl -s -H "Authorization: Bearer $GRAFANA_TOKEN" -H 'Content-Type: application/json' \
  -X POST http://localhost:3002/api/admin/users \
  -d '{"name":"nexa-readonly","email":"readonly@example.com","login":"nexa-readonly","password":"<set-password>"}'
```

